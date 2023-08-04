package views

import (
	"i_was_here/session"
	"i_was_here/ui/auth"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

// ShowUserDashboard displays the main user dashboard
func ShowUserDashboard(myApp fyne.App) {
	if session.CurrentUser != nil {
		/* 		userName := session.CurrentUser.Name
		   		userEmail := session.CurrentUser.Email
		*/
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
	} else {
		ShowErrorDialog(myApp, "You must be logged in to view this page.")
		ShowInitialView(myApp)
	}
}

// Add functions to show other views (e.g., posts, profile editing) similarly
func ShowCreatePostForm(myApp fyne.App) {
	myWindow := myApp.NewWindow("Create Post")

	// TODO: Implement the logic to capture a photo using the device's camera
	photoPreview := widget.NewLabel("Photo Preview")

	submitButton := widget.NewButton("Submit", func() {
		// TODO: Implement the logic to save the post with the captured photo
		ShowSuccessDialog(myApp, "Post created successfully!")
		ShowUserDashboard(myApp)
	})

	cancelButton := widget.NewButton("Cancel", func() {
		ShowUserDashboard(myApp)
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Create Post"),
		photoPreview,
		submitButton,
		cancelButton,
	)

	myWindow.SetContent(formContainer)
	myWindow.Show()
}

func ShowEditProfileForm(myApp fyne.App) {
	myWindow := myApp.NewWindow("Edit Profile")

	nameEntry := widget.NewEntry()
	nameEntry.SetText(session.CurrentUser.Name)

	emailEntry := widget.NewEntry()
	emailEntry.SetText(session.CurrentUser.Email)

	newPasswordEntry := widget.NewPasswordEntry()
	confirmPasswordEntry := widget.NewPasswordEntry()

	saveButton := widget.NewButton("Save Changes", func() {
		newName := nameEntry.Text
		newEmail := emailEntry.Text
		newPassword := newPasswordEntry.Text
		confirmPassword := confirmPasswordEntry.Text

		// Validate inputs
		if newName == "" && newEmail == "" && newPassword == "" {
			ShowErrorDialog(myApp, "No changes detected.")
			return
		}

		if newPassword != confirmPassword {
			ShowErrorDialog(myApp, "Passwords do not match")
			return
		}

		// Update user profile
		if err := auth.UpdateUserProfile(session.CurrentUser, newName, newEmail, newPassword); err != nil {
			ShowErrorDialog(myApp, "Failed to update profile. Please try again later.")
			return
		}

		ShowSuccessDialog(myApp, "Profile updated successfully!")
		ShowUserDashboard(myApp)
	})

	backButton := widget.NewButton("Back to Dashboard", func() {
		ShowUserDashboard(myApp)
	})

	formContainer := container.NewVBox(
		widget.NewLabel("Edit Profile"),
		widget.NewLabel("Name:"),
		nameEntry,
		widget.NewLabel("Email:"),
		emailEntry,
		widget.NewLabel("New Password:"),
		newPasswordEntry,
		widget.NewLabel("Confirm Password:"),
		confirmPasswordEntry,
		saveButton,
		backButton,
	)

	myWindow.SetContent(formContainer)
	myWindow.Show()
}
