package router

import (
	dysmsapi20170525 "github.com/alibabacloud-go/dysmsapi-20170525/v4/client"
	"lark-smsender/util"
	"net/http"
)

// SendAliSms /ali/sendSms
func SendAliSms(w http.ResponseWriter, r *http.Request) {
	body := util.HandleAliRequest(w, r)

	client, err := util.CreateAliClient(body.RequestData.AccessKeyId, body.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req := &dysmsapi20170525.SendSmsRequest{
		PhoneNumbers:  body.RequestData.PhoneNumbers,
		SignName:      body.RequestData.SignName,
		TemplateCode:  body.RequestData.TemplateCode,
		TemplateParam: body.RequestData.TemplateParam,
	}
	resp, err := client.SendSms(req)

	util.SendResponse(w, resp)
}

// SendBatchAliSms /ali/sendBatchSms
func SendBatchAliSms(w http.ResponseWriter, r *http.Request) {
	body := util.HandleAliRequest(w, r)

	client, err := util.CreateAliClient(body.RequestData.AccessKeyId, body.RequestData.AccessKeySecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req := &dysmsapi20170525.SendBatchSmsRequest{
		PhoneNumberJson:   body.RequestData.PhoneNumberJson,
		SignNameJson:      body.RequestData.SignNameJson,
		TemplateCode:      body.RequestData.TemplateCode,
		TemplateParamJson: body.RequestData.TemplateParamJson,
	}
	resp, err := client.SendBatchSms(req)

	util.SendResponse(w, resp)
}
