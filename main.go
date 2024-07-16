package main

import (
	"encoding/json"
	"fmt"
	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	dysmsapi20170525 "github.com/alibabacloud-go/dysmsapi-20170525/v4/client"
	util "github.com/alibabacloud-go/tea-utils/v2/service"
	"github.com/alibabacloud-go/tea/tea"
	"html/template"
	"io"
	"log"
	"net/http"
)

// Router
// /index.html
// render form ui
func index(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("./static/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Util
// init alibaba sms api client
func createAliClient(accessKeyId string, accessKeySecret string) (_result *dysmsapi20170525.Client, _err error) {
	config := &openapi.Config{
		AccessKeyId:     tea.String(accessKeyId),
		AccessKeySecret: tea.String(accessKeySecret),
	}
	config.Endpoint = tea.String("dysmsapi.aliyuncs.com")
	_result = &dysmsapi20170525.Client{}
	_result, _err = dysmsapi20170525.NewClient(config)
	return _result, _err
}

type AliRequestData struct {
	AccessKeyId     string `json:"accessKeyId"`
	AccessKeySecret string `json:"accessKeySecret"`
	// query list
	PageIndex *int `json:"pageIndex,omitempty"`
	// *send sms
}

type HandleAliQueryResult struct {
	RequestData AliRequestData
	Err         error
}

// Util
// handle api router POST query
func handleAliQuery(w http.ResponseWriter, r *http.Request) HandleAliQueryResult {
	var result HandleAliQueryResult

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body: "+err.Error(), http.StatusInternalServerError)
		result.Err = err
		return result
	}
	defer func(Body io.ReadCloser) {
		_ = Body.Close()
	}(r.Body)

	var requestData AliRequestData
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Error unmarshalling JSON: "+err.Error(), http.StatusBadRequest)
		result.Err = err
		return result
	}

	result.RequestData = requestData
	return result
}

// Util
func sendResponse(w http.ResponseWriter, result interface{}) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// Router
// /ali/getSignList
func getAliSignList(w http.ResponseWriter, r *http.Request) {
	src := handleAliQuery(w, r)
	client, err := createAliClient(src.RequestData.AccessKeyId, src.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	req := &dysmsapi20170525.QuerySmsSignListRequest{
		PageIndex: tea.Int32(1),
		PageSize:  tea.Int32(50),
	}
	runtime := &util.RuntimeOptions{}
	resp, err := client.QuerySmsSignListWithOptions(req, runtime)
	sendResponse(w, resp)
}

// Router
// /ali/getTemplateList
func getAliTemplateList(w http.ResponseWriter, r *http.Request) {
	src := handleAliQuery(w, r)
	client, err := createAliClient(src.RequestData.AccessKeyId, src.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	req := &dysmsapi20170525.QuerySmsTemplateListRequest{
		PageIndex: tea.Int32(1),
		PageSize:  tea.Int32(50),
	}
	runtime := &util.RuntimeOptions{}
	resp, err := client.QuerySmsTemplateListWithOptions(req, runtime)
	sendResponse(w, resp)
}

func main() {
	fmt.Println("http server started on port 8080")
	http.Handle(
		"/assets/",
		http.StripPrefix(
			"/assets/",
			http.FileServer(http.Dir("static/assets")),
		),
	)
	http.HandleFunc("/", index)
	http.HandleFunc("/ali/getSignList", getAliSignList)
	http.HandleFunc("/ali/getTemplateList", getAliTemplateList)
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
