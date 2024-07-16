package router

import (
	dysmsapi20170525 "github.com/alibabacloud-go/dysmsapi-20170525/v4/client"
	"github.com/alibabacloud-go/tea/tea"
	"lark-smsender/util"
	"net/http"
)

// GetAliSignList /ali/getSignList
func GetAliSignList(w http.ResponseWriter, r *http.Request) {
	body := util.HandleAliRequest(w, r)

	client, err := util.CreateAliClient(body.RequestData.AccessKeyId, body.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req := &dysmsapi20170525.QuerySmsSignListRequest{
		PageIndex: tea.Int32(1),
		PageSize:  tea.Int32(50),
	}
	resp, err := client.QuerySmsSignList(req)

	util.SendResponse(w, resp)
}

// GetAliTemplateList /ali/getTemplateList
func GetAliTemplateList(w http.ResponseWriter, r *http.Request) {
	body := util.HandleAliRequest(w, r)

	client, err := util.CreateAliClient(body.RequestData.AccessKeyId, body.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req := &dysmsapi20170525.QuerySmsTemplateListRequest{
		PageIndex: tea.Int32(1),
		PageSize:  tea.Int32(50),
	}
	resp, err := client.QuerySmsTemplateList(req)

	util.SendResponse(w, resp)
}
