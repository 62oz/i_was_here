package views

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

func ShowErrorDialog(myApp fyne.App, message string) {
	myWindow := myApp.NewWindow("Error")

	content := widget.NewLabel(message)
	dialog.ShowCustomConfirm("Error", "OK", "", content, func(b bool) {
		if b {
			// OK button clicked
			myWindow.Close()
		}
	}, myWindow)
}

func ShowSuccessDialog(myApp fyne.App, message string) {
	myWindow := myApp.NewWindow("Success")

	content := widget.NewLabel(message)
	dialog.ShowCustomConfirm("Success", "OK", "", content, func(b bool) {
		if b {
			// OK button clicked
			myWindow.Close()
		}
	}, myWindow)
}

func ShowInfoDialog(myApp fyne.App, message string) {
	myWindow := myApp.NewWindow("Info")

	content := widget.NewLabel(message)
	dialog.ShowCustomConfirm("Info", "OK", "", content, func(b bool) {
		if b {
			// OK button clicked
			myWindow.Close()
		}
	}, myWindow)
}

func ShowWarningDialog(myApp fyne.App, message string, callback func()) {
	myWindow := myApp.NewWindow("Warning")

	content := widget.NewLabel(message)
	dialog.ShowCustomConfirm("Warning", "OK", "Cancel", content, func(b bool) {
		if b {
			// OK button clicked
			myWindow.Close()
			callback()
		} else {
			// Cancel button clicked
			myWindow.Close()
		}
	}, myWindow)
}

func ShowConfirmDialog(myApp fyne.App, message string, callback func()) {
	myWindow := myApp.NewWindow("Confirm")

	content := widget.NewLabel(message)
	dialog.ShowCustomConfirm("Confirm", "OK", "Cancel", content, func(b bool) {
		if b {
			// OK button clicked
			myWindow.Close()
			callback()
		} else {
			// Cancel button clicked
			myWindow.Close()
		}
	}, myWindow)
}
