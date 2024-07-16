package router

import (
	"html/template"
	"net/http"
)

// RenderFrontend render static frontend
func RenderFrontend(w http.ResponseWriter, r *http.Request) {
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

// ServeAssets start assets file server
func ServeAssets(w http.ResponseWriter, r *http.Request) {
	http.StripPrefix(
		"/assets/",
		http.FileServer(http.Dir("static/assets")),
	)
}
