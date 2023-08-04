package views

import (
	"i_was_here/ui/auth"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

// ShowUserDashboard displays the main user dashboard
func ShowUserDashboard(myApp fyne.App) {
	myWindow := myApp.NewWindow("User Dashboard")

	// Create UI components for the dashboard
	// For example, you can add buttons to create posts, view profile, etc.
	createPostButton := widget.NewButton("Create Post", func() {
		// Implement logic to navigate to the post creation view
		// You can call a function from your windows package to switch views
	})

	editProfileButton := widget.NewButton("Edit Profile", func() {
		// Implement logic to navigate to the profile editing view
		// You can call a function from your windows package to switch views
	})

	logoutButton := widget.NewButton("Logout", func() {
		// Implement logic to handle user logout
		if err := auth.LogoutUser(); err != nil {
			ShowErrorDialog(myApp, "Logout failed. Please try again later.")
			return
		}

		ShowSuccessDialog(myApp, "Logout successful!")
		ShowInitialView(myApp)
	})

	dashboardContent := container.NewVBox(
		widget.NewLabel("Welcome to Your Dashboard"),
		createPostButton,
		editProfileButton,
		logoutButton,
		// Add more UI components here
	)

	myWindow.SetContent(dashboardContent)
	myWindow.Show()
}

// Add functions to show other views (e.g., posts, profile editing) similarly
func ShowCreatePostForm(myApp fyne.App) {
	// Implement this function
}

func ShowEditProfileForm(myApp fyne.App) {
	// Implement this function
}
