package main

import (
	"fmt"
	"lark-smsender/router"
	"log"
	"net/http"
)

func main() {
	fmt.Println("http server started on port 8080")

	http.HandleFunc(
		"/assets/",
		router.ServeAssets,
	)
	http.HandleFunc(
		"/",
		router.RenderFrontend,
	)

	http.HandleFunc(
		"/ali/getSignList",
		router.GetAliSignList,
	)
	http.HandleFunc(
		"/ali/getTemplateList",
		router.GetAliTemplateList,
	)

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
