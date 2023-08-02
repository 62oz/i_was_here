package main

import (
	"i_was_here/ui/views"

	"fyne.io/fyne/v2/app"
)

func main() {
	myApp := app.New()

	// Show the registration form
	views.ShowRegistrationForm(myApp)

	myApp.Run()
}
