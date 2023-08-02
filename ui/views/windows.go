package views

import (
	"i_was_here/ui/auth"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

func ShowRegistrationForm(myApp fyne.App) {
	myWindow := myApp.NewWindow("Registration Form")

	nameEntry := widget.NewEntry()
	emailEntry := widget.NewEntry()
	passwordEntry := widget.NewPasswordEntry()
	registerButton := widget.NewButton("Register", func() {
		name := nameEntry.Text
		email := emailEntry.Text
		password := passwordEntry.Text

		if err := auth.RegisterUser(name, email, password); err != nil {
			ShowErrorDialog(myApp, "Registration failed. Please try again later.")
			return
		}

		ShowSuccessDialog(myApp, "Registration successful! You can now log in.")
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Register a New Account"),
		widget.NewLabel("Name:"),
		nameEntry,
		widget.NewLabel("Email:"),
		emailEntry,
		widget.NewLabel("Password:"),
		passwordEntry,
		registerButton,
	)

	myWindow.SetContent(formContainer)
	myWindow.Show()
}

func ShowLoginForm(myApp fyne.App) {
	myWindow := myApp.NewWindow("Login Form")

	emailEntry := widget.NewEntry()
	passwordEntry := widget.NewPasswordEntry()
	loginButton := widget.NewButton("Login", func() {
		email := emailEntry.Text
		password := passwordEntry.Text

		if err := auth.LoginUser(email, password); err != nil {
			ShowErrorDialog(myApp, "Login failed. Please try again later.")
			return
		}

		ShowSuccessDialog(myApp, "Login successful!")
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Login to Your Account"),
		widget.NewLabel("Email:"),
		emailEntry,
		widget.NewLabel("Password:"),
		passwordEntry,
		loginButton,
	)

	myWindow.SetContent(formContainer)
	myWindow.Show()
}
