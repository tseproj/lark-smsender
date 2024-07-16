package util

import (
	"encoding/json"
	"io"
	"net/http"
)

type AliRequestData struct {
	AccessKeyId     string `json:"accessKeyId"`
	AccessKeySecret string `json:"accessKeySecret"`
	// Request list
	PageIndex *int `json:"pageIndex,omitempty"`
	// *send sms
}

type HandleAliRequestResult struct {
	RequestData AliRequestData
	Err         error
}

// HandleAliRequest handle api router POST request
func HandleAliRequest(w http.ResponseWriter, r *http.Request) HandleAliRequestResult {
	var result HandleAliRequestResult

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

// SendResponse Util
func SendResponse(w http.ResponseWriter, result interface{}) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
