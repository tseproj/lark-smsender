package main

import (
	"fmt"
	"html/template"
	"net/http"
	// dysmsapi20170525  "github.com/alibabacloud-go/dysmsapi-20170525/v4/client"
  // openapi  "github.com/alibabacloud-go/darabonba-openapi/v2/client"
  // util  "github.com/alibabacloud-go/tea-utils/v2/service"
)

func handleIndex(w http.ResponseWriter, r *http.Request) {
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

func main() {
	fmt.Println("http server started on port 8080")
	http.Handle(
		"/assets/",
		http.StripPrefix(
			"/assets/",
			http.FileServer(http.Dir("static/assets")),
		),
	)
	http.HandleFunc("/", handleIndex)
	http.ListenAndServe(":8080", nil)
}
