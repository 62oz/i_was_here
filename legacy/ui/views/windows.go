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
	confirmPasswordEntry := widget.NewPasswordEntry()
	registerButton := widget.NewButton("Register", func() {
		name := nameEntry.Text
		email := emailEntry.Text
		password := passwordEntry.Text
		confirmPassword := confirmPasswordEntry.Text

		if err := auth.RegisterUser(name, email, password, confirmPassword); err != nil {
			ShowErrorDialog(myApp, "Registration failed. Please try again later.")
			return
		}

		ShowSuccessDialog(myApp, "Registration successful! You can now log in.")
	})

	backButton := widget.NewButton("Back", func() {
		ShowLoginOrRegister(myApp)
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Register a New Account"),
		widget.NewLabel("Name:"),
		nameEntry,
		widget.NewLabel("Email:"),
		emailEntry,
		widget.NewLabel("Password:"),
		passwordEntry,
		widget.NewLabel("Confirm Password:"),
		confirmPasswordEntry,
		registerButton,
		backButton,
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
		ShowUserDashboard(myApp)
	})

	backButton := widget.NewButton("Back", func() {
		ShowLoginOrRegister(myApp)
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Login to Your Account"),
		widget.NewLabel("Email:"),
		emailEntry,
		widget.NewLabel("Password:"),
		passwordEntry,
		loginButton,
		backButton,
	)

	myWindow.SetContent(formContainer)
	myWindow.Show()
}

func ShowLoginOrRegister(myApp fyne.App) {
	myWindow := myApp.NewWindow("Login or Register")

	loginButton := widget.NewButton("Login", func() {
		ShowLoginForm(myApp)
	})

	registerButton := widget.NewButton("Register", func() {
		ShowRegistrationForm(myApp)
	})

	myWindow.SetContent(container.NewVBox(
		widget.NewLabel("Welcome to My App!"),
		widget.NewLabel("Please login or register to continue."),
		loginButton,
		registerButton,
	))
	myWindow.Show()
}

func ShowInitialView(myApp fyne.App) {
	if isAuthenticated() {
		ShowUserDashboard(myApp)
	} else {
		ShowLoginForm(myApp)
	}
}

func isAuthenticated() bool {
	// Implement your authentication logic here
	// Return true if the user is authenticated, otherwise false
	return true
}
