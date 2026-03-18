"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const STORAGE_KEY = "ecoboard-data-v7";
const LANGUAGE_KEY = "ecoboard-language-v1";
const SESSION_ACCOUNT_KEY = "ecoboard-session-account-v1";
const SESSION_VIEW_KEY = "ecoboard-session-view-v1";
const SURVEY_URL = "https://forms.cloud.microsoft/r/rn9GGZV6Na";
const LEGACY_STORAGE_KEYS = [];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const IS_DEV_BUILD = process.env.NODE_ENV !== "production";

function withBasePath(path) {
  return `${BASE_PATH}${path}`;
}

const CATEGORY_LABELS = {
  mobility: { de: "Mobilität", en: "Mobility" },
  nutrition: { de: "Ernährung", en: "Nutrition" },
  household: { de: "Haushalt", en: "Household" },
  custom: { de: "Individuell", en: "Custom" },
};

const FEEDBACK_CATEGORY_LABELS = {
  general: { de: "Allgemein", en: "General" },
  ...CATEGORY_LABELS,
};

const VIEW_ICONS = {
  sustainability: "leaf",
  activity: "spark",
  chat: "chat",
  settings: "settings",
  feedback: "feedback",
  survey: "survey",
};

const CATEGORY_ICONS = {
  mobility: "mobility",
  nutrition: "nutrition",
  household: "household",
  custom: "custom",
};

const COPY = {
  de: {
    primaryViewLabels: {
      sustainability: "Nachhaltigkeit",
      activity: "Nachhaltige Aktivität",
      chat: "Chat",
    },
    utilityNav: {
      activity: "Aktivität hinzufügen",
      leaderboard: "Leaderboard",
      dashboard: "Dashboard",
    },
    auth: {
      title: "Starte mit deiner Anmeldung.",
      text:
        "Beim ersten Aufruf siehst du nur die Anmeldung. Nach deinen persönlichen Daten kommst du direkt in den geschützten Bereich der App.",
      language: "Sprache auswählen",
      register: "Registrierung",
      login: "Login",
      fullName: "Voller Name",
      email: "E-Mail",
      city: "Stadt",
      age: "Alter",
      password: "Passwort",
      showPassword: "Passwort anzeigen",
      continue: "Weiter zur App",
      signIn: "Einloggen",
      forgotPassword: "Passwort vergessen",
      observerAccess: "Beobachterzugang",
      observerLabel: "Admin Ansicht",
      resetTitle: "Passwort vergessen",
      resetText:
        "Wenn du dein Passwort vergessen hast, kannst du es mit E-Mail, Stadt und Alter lokal zurücksetzen.",
      resetButton: "Passwort zurücksetzen",
      requiredField: "Pflichtfeld",
      loading: "Daten werden geladen...",
    },
    headerTitle: "Dein nachhaltiges Verhalten im Blick",
    loggedInAs: "Eingeloggt als",
    logout: "LogOut",
    sustainability: {
      eyebrow: "Nachhaltigkeit",
      title: "Informationen zur App",
      goalTitle: "Ziel der App",
      goalBody:
        "EcoTrack macht nachhaltiges Verhalten sichtbar. Nutzer können ihre Aktivitäten erfassen, Fortschritte vergleichen und ihre Entwicklung im Alltag anhand von Kennzahlen verfolgen.",
      backgroundTitle: "Hintergrund der App",
      backgroundBody:
        "Die Anwendung verbindet Motivation, Selbsteinschätzung und Community-Vergleich. Dadurch wird Nachhaltigkeit nicht abstrakt, sondern als konkrete tägliche Handlung erlebbar.",
      projectTitle: "Projektkontext",
      projectBody:
        "Diese App ist eine studentische Arbeit von Jens und David Ammann. Sie dient dazu, nachhaltige Aktivitäten einfach zu dokumentieren und auf moderne, visuelle Weise auszuwerten.",
      photoMissingTitle: "Bilddatei fehlt noch im Projekt",
      photoMissingBody:
        "Lege euer Foto als public/student-team.jpg, public/student-team.jpeg oder public/student-team.png ab, dann wird es hier automatisch angezeigt.",
    },
    activity: {
      eyebrow: "Nachhaltige Aktivität",
      title: "Aktivität hinzufügen",
      level: "Level",
      treeTitle: "EcoTree",
      treeStageRoots: (progress) => `Wurzeln wachsen: ${progress}%`,
      treeStageTrunk: (progress) => `Der Stamm bildet sich: ${progress}%`,
      treeStageCrown: (level) => `Der Baum wächst weiter auf Level ${level}`,
      levelProgress: (pointsToNext, nextLabel, nextThreshold) =>
        `Noch ${pointsToNext} Punkte bis ${nextLabel} bei ${nextThreshold} Punkten.`,
      progress: "Fortschritt",
      today: "Heute",
      week: "Diese Woche",
      saveActivity: "Aktivität speichern",
      addToList: "Zur Liste hinzufügen",
      addAgain: "Erneut hinzufügen",
      removeFromList: "Entfernen",
      batchTitle: "Sammelliste",
      batchEmpty: "Noch keine Aktivitäten ausgewählt.",
      batchSelected: (count, points) => `${count} Aktivitäten ausgewählt • ${points} Punkte`,
      batchSave: "Alle ausgewählten speichern",
      batchClear: "Liste leeren",
      requestTitle: "Neue Aktivität zur Freigabe einreichen",
      requestPlaceholder: "Zum Beispiel Lastenrad für Wocheneinkauf",
      requestPointsPlaceholder: "Zum Beispiel 5",
      requestSubmit: "Zur Entwickler-Freigabe senden",
      customTitle: "Individuelle Aktivität erfassen",
      developerSend: "Zum Entwickler senden",
      customLabel: "Aktivität",
      customPlaceholder: "Zum Beispiel Kleidungsstücke repariert",
      customPoints: "Punkte",
      customSave: "Custom-Aktivität speichern",
      recentlyActive: "Zuletzt aktiv",
      tableDate: "Datum",
      tableCategory: "Kategorie",
      tableActivity: "Aktivität",
      tablePoints: "Punkte",
      noActivities: "Noch keine Aktivitäten gespeichert.",
    },
    dashboard: {
      eyebrow: "Dashboard",
      title: (name) => `Statistik für ${name}`,
      rank: (rank, count) => `Rang ${rank} von ${count}`,
      exportExcel: "Excel aus Convex exportieren",
      exportAllExcel: "Alle Convex-Daten exportieren",
      exportLoading: "Excel wird erstellt...",
      exportAllLoading: "Gesamt-Export wird erstellt...",
      exportHint: "Lädt die gespeicherten Convex-Daten und erstellt eine echte XLSX-Datei.",
      exportAllHint: "Erstellt eine Admin-Excel mit allen Nutzern und allen Aktivitätseinträgen aus Convex.",
      exportFilterTitle: "Export-Zeitraum",
      exportFilterPreset: "Zeitraum auswählen",
      exportFilterFrom: "Von",
      exportFilterTo: "Bis",
      exportFilterAll: "Alle Daten",
      exportFilterToday: "Heute",
      exportFilter7Days: "Letzte 7 Tage",
      exportFilter30Days: "Letzte 30 Tage",
      exportFilter90Days: "Letzte 90 Tage",
      exportFilterThisMonth: "Dieser Monat",
      exportFilterLastMonth: "Letzter Monat",
      exportFilterYear: "Dieses Jahr",
      exportFilterCustom: "Eigener Zeitraum",
      exportFilterActive: (label, count) => `${label} • ${count} Einträge im Export`,
      exportPreviewTitle: "Export-Vorschau",
      exportPreviewEntries: "Einträge",
      exportPreviewUsers: "Nutzer",
      exportPreviewModeUser: "Nutzer-Export",
      exportPreviewModeAdmin: "Admin-Export",
      today: "Heute",
      week: "Woche",
      month: "Monat",
      activities: "Aktivitäten",
      dailyChart: "Tagesdiagramm",
      dailyRange: "Letzte 7 Tage",
      weeklyChart: "Wochen-Diagramm",
      weeklyRange: "Letzte 4 Wochen",
      monthlyChart: "Monats-Diagramm",
      monthlyRange: "Letzte 6 Monate",
      statsTable: "Statistik-Tabelle",
      period: "Zeitraum",
      points: "Punkte",
      details: "Details",
      categories: "Kategorien",
      developerReview: "Entwickler-Freigaben",
      pendingRequests: "Offene Vorschläge",
      approve: "Genehmigen",
      reject: "Ablehnen",
      noRequests: "Keine offenen Vorschläge vorhanden.",
      day: "Tag",
      weekDetail: "Letzte 7 Tage",
      monthDetail: "Letzte 30 Tage",
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Vergleich mit anderen Nutzern",
      monthlyPoints: "Punkte im Monat",
      rankingTable: "Ranking-Tabelle",
      rank: "Rang",
      name: "Name",
      day: "Tag",
      week: "Woche",
      month: "Monat",
      noUsers: "Noch keine Nutzer im Leaderboard.",
      monthCompare: "Monatsvergleich",
      topUsers: "Top 5 Nutzer",
    },
    settings: {
      navLabel: "Einstellungen",
      eyebrow: "Einstellungen",
      title: "Konto verwalten",
      profileTitle: "Persönliche Daten",
      saveProfile: "Daten speichern",
      passwordTitle: "Passwort ändern",
      currentPassword: "Aktuelles Passwort",
      newPassword: "Neues Passwort",
      confirmPassword: "Neues Passwort bestätigen",
      changePassword: "Passwort aktualisieren",
      resetPasswordTitle: "Passwort zurücksetzen",
      resetPasswordButton: "Ohne aktuelles Passwort zurücksetzen",
      deleteTitle: "Account löschen",
      deleteText: "Der Account und die dazugehörigen persönlichen Daten werden lokal aus dieser App entfernt.",
      deleteButton: "Account endgültig löschen",
    },
    feedback: {
      navLabel: "Vorschläge",
      eyebrow: "Feedback",
      title: "Verbesserungsvorschläge zur Web-App",
      userLabel: "User-Name",
      categoryLabel: "Bereich",
      generalArea: "Allgemeine Verbesserungsvorschläge",
      suggestionLabel: "Verbesserungsvorschlag",
      suggestionPlaceholder: "Was sollten wir an EcoTrack verbessern?",
      submit: "An Entwickler senden",
    },
    survey: {
      navLabel: "Umfrage",
      eyebrow: "Bewertung",
      title: "Website bewerten",
      text:
        "Hier können Nutzer direkt an eurer Microsoft-Forms-Umfrage teilnehmen und die Web-App bewerten.",
      button: "Umfrage öffnen",
      linkLabel: "Microsoft Forms",
    },
    imprint: {
      label: "Impressum",
      title: "Impressum",
      body: "Das vollständige Impressum ist über den Footer-Link aufrufbar.",
    },
    chat: {
      eyebrow: "Community",
      title: "Chat und Abstimmungen",
      chatTitle: "Community-Chat",
      chatBody: "Tauscht euch über nachhaltige Aktivitäten aus oder besprecht neue Ideen.",
      placeholder: (name) => `Was möchtest du teilen, ${name}?`,
      send: "Senden",
      noMessages: "Noch keine Nachrichten vorhanden.",
      proposalTitle: "Custom-Aktivitäten bewerten",
      proposalBody:
        "Community-Mitglieder können abstimmen, wie viele Punkte eine manuell eingetragene Aktivität bekommen sollte.",
      createTitle: "Neue Abstimmung anlegen",
      createLabel: "Aktivität",
      createPlaceholder: "Zum Beispiel Bio-Produkte gegessen",
      createPoints: "Punkte",
      createCategory: "Kategorie",
      createButton: "Abstimmung starten",
      approve: "Zustimmen",
      reject: "Ablehnen",
      fromOn: (name, date) => `von ${name} am ${date}`,
      suggestion: "Vorschlag",
      communityValue: "Community-Wert",
      votes: "Stimmen",
      noProposals: "Noch keine Custom-Aktivitäten zur Abstimmung.",
      noValues: "Noch keine Werte vorhanden.",
    },
    status: {
      loginFirst: "Bitte melde dich zuerst an.",
      signedIn: "Du bist angemeldet.",
      fillAll: "Bitte alle persönlichen Daten ausfüllen.",
      accountExists: "Zu dieser E-Mail gibt es bereits ein Konto.",
      registerWelcome: (name) =>
        `Schön, dass du ein Teil der EcoTrack Community bist, ${name}. Viel Spaß und viel Erfolg.`,
      accountMissing: "Die E-Mail ist falsch.",
      wrongPassword: "E-Mail oder Passwort falsch.",
      welcomeBack: (name) => `Willkommen zurück, ${name}.`,
      loggedOut: "Du wurdest ausgeloggt.",
      pleaseLogin: "Bitte zuerst anmelden.",
      activityAdded: (title, points) => `Aktivität hinzugefügt: ${title} (+${points}).`,
      activitiesAdded: (count, points) => `${count} Aktivitäten hinzugefügt (+${points}).`,
      requestSubmitted: (title) => `"${title}" wurde zur Entwickler-Freigabe eingereicht.`,
      requestApproved: (title) => `"${title}" wurde genehmigt und ist jetzt verfügbar.`,
      requestRejected: (title) => `"${title}" wurde abgelehnt.`,
      customInvalid: "Bitte gib für Custom einen Namen und gültige Punkte an.",
      customNote: "Individuell eingetragene Aktivität.",
      customProposal: (title, points) =>
        `hat eine Custom-Aktivität vorgeschlagen: "${title}" mit ${points} Punkten. Bitte abstimmen.`,
      developerMailOpened: (title) =>
        `Mail-Entwurf für "${title}" an ${DEVELOPER_EMAIL} wurde geöffnet.`,
      messageSent: "Nachricht gesendet.",
      voteSaved: (points) => `Deine Abstimmung mit ${points} Punkten wurde gespeichert.`,
      proposalApproved: (title) => `Du stimmst "${title}" zu.`,
      proposalRejected: (title) => `Du lehnst "${title}" ab.`,
      messageDeleted: "Deine Nachricht wurde gelöscht.",
      profileUpdated: "Deine persönlichen Daten wurden aktualisiert.",
      currentPasswordWrong: "Das aktuelle Passwort stimmt nicht.",
      passwordTooShort: "Das neue Passwort muss mindestens 4 Zeichen haben.",
      passwordMismatch: "Die neuen Passwörter stimmen nicht überein.",
      passwordChanged: "Dein Passwort wurde aktualisiert.",
      passwordReset: "Dein Passwort wurde zurückgesetzt.",
      resetDataMismatch: "Die Angaben passen zu keinem Konto.",
      accountDeleted: "Dein Account wurde gelöscht.",
      feedbackSent: "Dein Verbesserungsvorschlag wurde an den Entwickler gesendet.",
      exportRequiresAccount: "Für den Excel-Export musst du mit einem echten Konto angemeldet sein.",
      exportAdminLoading: "Die Admin-Daten aus Convex werden noch geladen. Bitte gleich erneut versuchen.",
      exportLoading: "Die Convex-Daten werden noch geladen. Bitte gleich erneut versuchen.",
      exportDateRangeInvalid: "Bitte wähle einen gültigen Zeitraum. Das Bis-Datum darf nicht vor dem Von-Datum liegen.",
      exportNoData: "Für den gewählten Zeitraum wurden keine Daten gefunden.",
      exportSuccess: (count) => `Excel-Export erstellt. ${count} Einträge wurden heruntergeladen.`,
      exportAllSuccess: (count, users) =>
        `Admin-Export erstellt. ${count} Einträge von ${users} Nutzern wurden heruntergeladen.`,
      exportError: "Excel-Export fehlgeschlagen. Bitte erneut versuchen.",
      genericError: "Technischer Fehler. Bitte erneut versuchen.",
    },
  },
  en: {
    primaryViewLabels: {
      sustainability: "Sustainability",
      activity: "Sustainable Activity",
      chat: "Chat",
    },
    utilityNav: {
      activity: "Add Activity",
      leaderboard: "Leaderboard",
      dashboard: "Dashboard",
    },
    auth: {
      title: "Start by signing in.",
      text:
        "On your first visit you will only see the sign-in screen. After entering your personal details, you will go straight to the protected area of the app.",
      language: "Choose language",
      register: "Register",
      login: "Login",
      fullName: "Full Name",
      email: "Email",
      city: "City",
      age: "Age",
      password: "Password",
      showPassword: "Show password",
      continue: "Continue to App",
      signIn: "Sign In",
      forgotPassword: "Forgot password",
      observerAccess: "Observer Access",
      observerLabel: "Admin View",
      resetTitle: "Forgot Password",
      resetText:
        "If you forgot your password, you can reset it locally using your email, city, and age.",
      resetButton: "Reset Password",
      requiredField: "Required field",
      loading: "Loading data...",
    },
    headerTitle: "Track your sustainable habits at a glance",
    loggedInAs: "Signed in as",
    logout: "Log Out",
    sustainability: {
      eyebrow: "Sustainability",
      title: "About the App",
      goalTitle: "Goal of the App",
      goalBody:
        "EcoTrack makes sustainable behavior visible. Users can log activities, compare progress, and track their development in daily life through key metrics.",
      backgroundTitle: "Background",
      backgroundBody:
        "The application combines motivation, self-assessment, and community comparison. This turns sustainability from an abstract idea into a concrete daily action.",
      projectTitle: "Project Context",
      projectBody:
        "This app is a student project by Jens and David Ammann. It is designed to document sustainable activities in a simple way and evaluate them through a modern visual interface.",
      photoMissingTitle: "Image file is still missing in the project",
      photoMissingBody:
        "Place your photo as public/student-team.jpg, public/student-team.jpeg or public/student-team.png and it will appear here automatically.",
    },
    activity: {
      eyebrow: "Sustainable Activity",
      title: "Add Activity",
      level: "Level",
      treeTitle: "EcoTree",
      treeStageRoots: (progress) => `Roots growing: ${progress}%`,
      treeStageTrunk: (progress) => `Trunk forming: ${progress}%`,
      treeStageCrown: (level) => `The tree keeps growing at level ${level}`,
      levelProgress: (pointsToNext, nextLabel, nextThreshold) =>
        `${pointsToNext} points left until ${nextLabel} at ${nextThreshold} points.`,
      progress: "Progress",
      today: "Today",
      week: "This Week",
      saveActivity: "Save Activity",
      addToList: "Add to List",
      addAgain: "Add Again",
      removeFromList: "Remove",
      batchTitle: "Selection",
      batchEmpty: "No activities selected yet.",
      batchSelected: (count, points) => `${count} activities selected • ${points} points`,
      batchSave: "Save All Selected",
      batchClear: "Clear List",
      requestTitle: "Submit New Activity for Approval",
      requestPlaceholder: "For example cargo bike for weekly shopping",
      requestPointsPlaceholder: "For example 5",
      requestSubmit: "Send for Developer Approval",
      customTitle: "Add Custom Activity",
      developerSend: "Send to Developer",
      customLabel: "Activity",
      customPlaceholder: "For example repaired clothing",
      customPoints: "Points",
      customSave: "Save Custom Activity",
      recentlyActive: "Recently active",
      tableDate: "Date",
      tableCategory: "Category",
      tableActivity: "Activity",
      tablePoints: "Points",
      noActivities: "No activities saved yet.",
    },
    dashboard: {
      eyebrow: "Dashboard",
      title: (name) => `Statistics for ${name}`,
      rank: (rank, count) => `Rank ${rank} of ${count}`,
      exportExcel: "Export Convex data to Excel",
      exportAllExcel: "Export all Convex data",
      exportLoading: "Creating Excel file...",
      exportAllLoading: "Creating full export...",
      exportHint: "Loads the saved Convex data and creates a real XLSX file.",
      exportAllHint: "Creates an admin Excel workbook with all users and all activity entries from Convex.",
      exportFilterTitle: "Export range",
      exportFilterPreset: "Select range",
      exportFilterFrom: "From",
      exportFilterTo: "To",
      exportFilterAll: "All data",
      exportFilterToday: "Today",
      exportFilter7Days: "Last 7 days",
      exportFilter30Days: "Last 30 days",
      exportFilter90Days: "Last 90 days",
      exportFilterThisMonth: "This month",
      exportFilterLastMonth: "Last month",
      exportFilterYear: "This year",
      exportFilterCustom: "Custom range",
      exportFilterActive: (label, count) => `${label} • ${count} entries in export`,
      exportPreviewTitle: "Export preview",
      exportPreviewEntries: "Entries",
      exportPreviewUsers: "Users",
      exportPreviewModeUser: "User export",
      exportPreviewModeAdmin: "Admin export",
      today: "Today",
      week: "Week",
      month: "Month",
      activities: "Activities",
      dailyChart: "Daily Chart",
      dailyRange: "Last 7 Days",
      weeklyChart: "Weekly Chart",
      weeklyRange: "Last 4 Weeks",
      monthlyChart: "Monthly Chart",
      monthlyRange: "Last 6 Months",
      statsTable: "Statistics Table",
      period: "Period",
      points: "Points",
      details: "Details",
      categories: "Categories",
      developerReview: "Developer Review",
      pendingRequests: "Open Suggestions",
      approve: "Approve",
      reject: "Reject",
      noRequests: "No open suggestions.",
      day: "Day",
      weekDetail: "Last 7 Days",
      monthDetail: "Last 30 Days",
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Compare with Other Users",
      monthlyPoints: "points this month",
      rankingTable: "Ranking Table",
      rank: "Rank",
      name: "Name",
      day: "Day",
      week: "Week",
      month: "Month",
      noUsers: "No users in the leaderboard yet.",
      monthCompare: "Monthly Comparison",
      topUsers: "Top 5 Users",
    },
    settings: {
      navLabel: "Settings",
      eyebrow: "Settings",
      title: "Manage Account",
      profileTitle: "Personal Details",
      saveProfile: "Save Details",
      passwordTitle: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      changePassword: "Update Password",
      resetPasswordTitle: "Reset Password",
      resetPasswordButton: "Reset Without Current Password",
      deleteTitle: "Delete Account",
      deleteText: "This will remove the account and its personal data locally from this app.",
      deleteButton: "Delete Account Permanently",
    },
    feedback: {
      navLabel: "Suggestions",
      eyebrow: "Feedback",
      title: "Suggestions for the Web App",
      userLabel: "User Name",
      categoryLabel: "Area",
      generalArea: "General Improvements",
      suggestionLabel: "Suggestion",
      suggestionPlaceholder: "What should we improve in EcoTrack?",
      submit: "Send to Developer",
    },
    survey: {
      navLabel: "Survey",
      eyebrow: "Rating",
      title: "Rate the Website",
      text:
        "Users can open your Microsoft Forms survey here directly and rate the web app.",
      button: "Open Survey",
      linkLabel: "Microsoft Forms",
    },
    imprint: {
      label: "Legal Notice",
      title: "Legal Notice",
      body: "The full legal notice is available via the footer link.",
    },
    chat: {
      eyebrow: "Community",
      title: "Chat and Voting",
      chatTitle: "Community Chat",
      chatBody: "Talk about sustainable activities or discuss new ideas.",
      placeholder: (name) => `What would you like to share, ${name}?`,
      send: "Send",
      noMessages: "No messages yet.",
      proposalTitle: "Rate Custom Activities",
      proposalBody:
        "Community members can vote on how many points a manually entered activity should receive.",
      createTitle: "Create New Vote",
      createLabel: "Activity",
      createPlaceholder: "For example ate organic products",
      createPoints: "Points",
      createCategory: "Category",
      createButton: "Start Vote",
      approve: "Approve",
      reject: "Reject",
      fromOn: (name, date) => `by ${name} on ${date}`,
      suggestion: "Proposal",
      communityValue: "Community value",
      votes: "votes",
      noProposals: "No custom activities to vote on yet.",
      noValues: "No values yet.",
    },
    status: {
      loginFirst: "Please sign in first.",
      signedIn: "You are signed in.",
      fillAll: "Please fill in all personal details.",
      accountExists: "An account already exists for this email.",
      registerWelcome: (name) =>
        `Welcome to the EcoTrack community, ${name}. Have fun and good luck.`,
      accountMissing: "The email is incorrect.",
      wrongPassword: "Email or password is incorrect.",
      welcomeBack: (name) => `Welcome back, ${name}.`,
      loggedOut: "You have been logged out.",
      pleaseLogin: "Please sign in first.",
      activityAdded: (title, points) => `Activity added: ${title} (+${points}).`,
      activitiesAdded: (count, points) => `${count} activities added (+${points}).`,
      requestSubmitted: (title) => `"${title}" was submitted for developer approval.`,
      requestApproved: (title) => `"${title}" was approved and is now available.`,
      requestRejected: (title) => `"${title}" was rejected.`,
      customInvalid: "Please enter a custom activity name and valid points.",
      customNote: "Custom activity entered manually.",
      customProposal: (title, points) =>
        `proposed a custom activity: "${title}" with ${points} points. Please vote.`,
      developerMailOpened: (title) =>
        `Draft email for "${title}" to ${DEVELOPER_EMAIL} was opened.`,
      messageSent: "Message sent.",
      voteSaved: (points) => `Your vote with ${points} points has been saved.`,
      proposalApproved: (title) => `You approved "${title}".`,
      proposalRejected: (title) => `You rejected "${title}".`,
      messageDeleted: "Your message was deleted.",
      profileUpdated: "Your personal details were updated.",
      currentPasswordWrong: "The current password is incorrect.",
      passwordTooShort: "The new password must be at least 4 characters long.",
      passwordMismatch: "The new passwords do not match.",
      passwordChanged: "Your password was updated.",
      passwordReset: "Your password was reset.",
      resetDataMismatch: "The provided details do not match any account.",
      accountDeleted: "Your account was deleted.",
      feedbackSent: "Your suggestion was sent to the developer.",
      exportRequiresAccount: "You need to sign in with a real account to export Excel data.",
      exportAdminLoading: "Admin data from Convex is still loading. Please try again in a moment.",
      exportLoading: "Convex data is still loading. Please try again in a moment.",
      exportDateRangeInvalid: "Please choose a valid date range. The end date cannot be before the start date.",
      exportNoData: "No data was found for the selected range.",
      exportSuccess: (count) => `Excel export created. ${count} entries were downloaded.`,
      exportAllSuccess: (count, users) =>
        `Admin export created. ${count} entries from ${users} users were downloaded.`,
      exportError: "Excel export failed. Please try again.",
      genericError: "Technical error. Please try again.",
    },
  },
};

const SUGGESTIONS = {
  mobility: [
    { title: "Mit dem Fahrrad zur Arbeit", points: 2, note: "Mit dem Fahrrad zur Arbeit." },
    { title: "Zu Fuß zur Arbeit", points: 3, note: "Zu Fuß zur Arbeit." },
    { title: "Öffentliche Verkehrsmittel genutzt", points: 3, note: "Öffentliche Verkehrsmittel genutzt." },
    { title: "Fahrgemeinschaft organisiert", points: 2, note: "Fahrgemeinschaft gebildet." },
    { title: "Home Office statt Pendeln", points: 5, note: "Spart den kompletten Arbeitsweg." },
    { title: "Kurze Strecke ohne Auto", points: 3, note: "Kurze Strecke ohne Auto unter 5 km." },
    { title: "E-Bike statt Auto genutzt", points: 3, note: "E-Bike statt Auto genutzt." },
  ],
  nutrition: [
    { title: "Vegetarisch gegessen", points: 3, note: "Vegetarische Mahlzeit gegessen." },
    { title: "Vegan gegessen", points: 4, note: "Vegane Mahlzeit gegessen." },
    { title: "Selbst gekocht", points: 2, note: "Selbst gekocht." },
    { title: "Reste verwertet", points: 3, note: "Reste sinnvoll verwertet." },
    { title: "Leitungswasser statt Flaschenwasser", points: 2, note: "Leitungswasser statt Flaschenwasser getrunken." },
    { title: "Regionale Produkte gekauft", points: 2, note: "Regionale Produkte gekauft." },
    { title: "Lebensmittel vor Verschwendung gerettet", points: 5, note: "Lebensmittel vor Verschwendung gerettet." },
  ],
  household: [
    { title: "Duschzeit reduziert", points: 3, note: "Duschzeit reduziert." },
    { title: "Waschmaschine voll beladen genutzt", points: 2, note: "Waschmaschine voll beladen genutzt." },
    { title: "Wäsche luftgetrocknet", points: 3, note: "Wäsche luftgetrocknet statt Trockner." },
    { title: "Geschirrspüler im Eco-Modus", points: 2, note: "Geschirrspüler im Eco-Modus genutzt." },
    { title: "Standby-Geräte ausgeschaltet", points: 2, note: "Standby-Geräte ausgeschaltet." },
    { title: "Heizung gesenkt", points: 4, note: "Heizung gesenkt." },
    { title: "Licht ausgeschaltet, wenn nicht nötig", points: 1, note: "Licht ausgeschaltet, wenn es nicht nötig war." },
  ],
  custom: [
    { title: "Second-Hand-Produkt gekauft", points: 3, note: "Second-Hand-Produkt gekauft." },
    { title: "Kleidung repariert", points: 4, note: "Kleidung repariert." },
    { title: "Elektronisches Gerät repariert", points: 5, note: "Elektronisches Gerät repariert." },
    { title: "Wiederverwendbare Produkte genutzt", points: 2, note: "Wiederverwendbare Produkte genutzt." },
    { title: "Baum oder Pflanze gesetzt", points: 5, note: "Baum oder Pflanze gesetzt." },
    { title: "An Nachhaltigkeits-Event teilgenommen", points: 4, note: "An einem Nachhaltigkeits-Event teilgenommen." },
  ],
};

const ACTIVITY_EN_OVERRIDES = {
  mobility: {
    "Mit dem Fahrrad zur Arbeit": { title: "Bike to work", note: "Bike to work." },
    "Zu Fuß zur Arbeit": { title: "Walk to work", note: "Walk to work." },
    "Öffentliche Verkehrsmittel genutzt": { title: "Used public transport", note: "Use public transport." },
    "Fahrgemeinschaft organisiert": { title: "Organized carpooling", note: "Organized carpooling." },
    "Home Office statt Pendeln": { title: "Worked from home instead of commuting", note: "Saves the full commute." },
    "Kurze Strecke ohne Auto": { title: "Short trip without car", note: "Short trip without car under 5 km." },
    "E-Bike statt Auto genutzt": { title: "Used e-bike instead of car", note: "Used e-bike instead of car." },
  },
  nutrition: {
    "Vegetarisch gegessen": { title: "Ate vegetarian", note: "Ate a vegetarian meal." },
    "Vegan gegessen": { title: "Ate vegan", note: "Ate a vegan meal." },
    "Selbst gekocht": { title: "Cooked at home", note: "Cooked at home." },
    "Reste verwertet": { title: "Used leftovers", note: "Used leftovers." },
    "Leitungswasser statt Flaschenwasser": {
      title: "Drank tap water instead of bottled water",
      note: "Drank tap water instead of bottled water.",
    },
    "Regionale Produkte gekauft": { title: "Bought regional products", note: "Bought regional products." },
    "Lebensmittel vor Verschwendung gerettet": { title: "Saved food from waste", note: "Saved food from waste." },
  },
  household: {
    "Duschzeit reduziert": { title: "Reduced shower time", note: "Reduced shower time." },
    "Waschmaschine voll beladen genutzt": {
      title: "Used fully loaded washing machine",
      note: "Used a fully loaded washing machine.",
    },
    "Wäsche luftgetrocknet": { title: "Air-dried laundry", note: "Air-dried laundry instead of using a dryer." },
    "Geschirrspüler im Eco-Modus": { title: "Used dishwasher eco mode", note: "Used dishwasher eco mode." },
    "Standby-Geräte ausgeschaltet": { title: "Switched off standby devices", note: "Switched off standby devices." },
    "Heizung gesenkt": { title: "Lowered heating", note: "Lowered heating temperature." },
    "Licht ausgeschaltet, wenn nicht nötig": {
      title: "Switched off lights when not needed",
      note: "Switched off lights when not needed.",
    },
  },
  custom: {
    "Second-Hand-Produkt gekauft": { title: "Bought second-hand product", note: "Bought a second-hand product." },
    "Kleidung repariert": { title: "Repaired clothing", note: "Repaired clothing." },
    "Elektronisches Gerät repariert": { title: "Repaired electronic device", note: "Repaired an electronic device." },
    "Wiederverwendbare Produkte genutzt": { title: "Used reusable products", note: "Used reusable products." },
    "Baum oder Pflanze gesetzt": { title: "Planted a tree or plant", note: "Planted a tree or plant." },
    "An Nachhaltigkeits-Event teilgenommen": {
      title: "Joined a sustainability event",
      note: "Participated in a sustainability event.",
    },
  },
};

const EMPTY_STATE = {
  accounts: [],
  activeAccountId: null,
  chatMessages: [],
  customProposals: [],
  activityRequests: [],
  approvedActivities: [],
};

export default function Page() {
  const [appState, setAppState] = useState(EMPTY_STATE);
  const [hasHydratedState, setHasHydratedState] = useState(false);
  const [hasRestoredView, setHasRestoredView] = useState(false);
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState(COPY.de.status.loginFirst);
  const [authMode, setAuthMode] = useState("register");
  const [observerMode, setObserverMode] = useState(false);
  const [view, setView] = useState("sustainability");
  const [selectedCategory, setSelectedCategory] = useState("mobility");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestPoints, setRequestPoints] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalPoints, setProposalPoints] = useState("");
  const [proposalCategory, setProposalCategory] = useState("mobility");
  const [chatMessage, setChatMessage] = useState("");
  const [pendingActivities, setPendingActivities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingAllExcel, setIsExportingAllExcel] = useState(false);
  const [exportRangePreset, setExportRangePreset] = useState("30d");
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
  const remoteAppState = useQuery(api.appState.get, { name: "main" });
  const saveRemoteAppState = useMutation(api.appState.save);
  const registerUser = useMutation(api.users.register);
  const loginUser = useMutation(api.users.login);
  const updateUserProfile = useMutation(api.users.updateProfile);
  const changeUserPassword = useMutation(api.users.changePassword);
  const deleteUser = useMutation(api.users.deleteUser);
  const upsertActivityCatalog = useMutation(api.activityTracking.upsertCatalog);
  const addActivityEntries = useMutation(api.activityTracking.addEntries);
  const activeAccount = getActiveAccount(appState);
  const convexActivityEntries = useQuery(
    api.activityTracking.getUserEntries,
    activeAccount?.backendUserId ? { userId: activeAccount.backendUserId } : "skip",
  );
  const canAdminExport = observerMode;
  const convexUsers = useQuery(api.users.list, canAdminExport ? {} : "skip");
  const convexAllActivityEntries = useQuery(
    api.activityTracking.getAllEntries,
    canAdminExport ? {} : "skip",
  );
  const copy = COPY[language];
  const selectedExportRangeLabel = getExportRangeLabel(exportRangePreset, copy);
  const filteredUserExportEntries = filterEntriesForExport(convexActivityEntries, {
    preset: exportRangePreset,
    from: exportDateFrom,
    to: exportDateTo,
  });
  const filteredAdminExportEntries = filterEntriesForExport(convexAllActivityEntries, {
    preset: exportRangePreset,
    from: exportDateFrom,
    to: exportDateTo,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage === "de" || storedLanguage === "en") {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (exportRangePreset === "custom") {
      return;
    }

    const range = getPresetDateRange(exportRangePreset);
    setExportDateFrom(range.from);
    setExportDateTo(range.to);
  }, [exportRangePreset]);

  useEffect(() => {
    if (hasHydratedState || remoteAppState === undefined) {
      return;
    }

    const baseState = remoteAppState?.state
      ? normalizeStoredState(remoteAppState.state)
      : loadState();
    const storedSessionAccountId = getStoredSessionAccountId();
    const hasStoredSessionAccount = storedSessionAccountId
      ? baseState.accounts.some((account) => account.id === storedSessionAccountId)
      : false;
    const loaded = {
      ...baseState,
      activeAccountId: hasStoredSessionAccount ? storedSessionAccountId : null,
    };
    setAppState(loaded);
    setHasHydratedState(true);

    if (loaded.activeAccountId) {
      setStatus(COPY[language].status.signedIn);
    }
  }, [hasHydratedState, language, remoteAppState]);

  useEffect(() => {
    if (!hasHydratedState) {
      return;
    }

    saveRemoteAppState({
      name: "main",
      state: {
        ...appState,
        activeAccountId: null,
      },
    }).catch((error) => {
      console.error("Konnte App-Status nicht in Convex speichern.", error);
    });
  }, [appState, hasHydratedState, saveRemoteAppState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!hasHydratedState) {
      return;
    }

    setStoredSessionAccountId(appState.activeAccountId || null);
  }, [appState.activeAccountId, hasHydratedState]);

  useEffect(() => {
    if (!hasHydratedState || hasRestoredView) {
      return;
    }

    if (!appState.activeAccountId) {
      setHasRestoredView(true);
      return;
    }

    const storedView = getStoredSessionView();
    if (storedView) {
      setView(storedView);
    }
    setHasRestoredView(true);
  }, [appState.activeAccountId, hasHydratedState, hasRestoredView]);

  useEffect(() => {
    if (!hasHydratedState || !appState.activeAccountId) {
      return;
    }

    setStoredSessionView(view);
  }, [appState.activeAccountId, hasHydratedState, view]);

  const sessionAccount = activeAccount || (observerMode ? createObserverAccount(copy) : null);
  const leaderboard = getLeaderboardData(appState.accounts);
  const activeStats = sessionAccount ? getAccountStats(sessionAccount, language) : createEmptyStats(language);
  const activeRank = activeAccount
    ? leaderboard.find((item) => item.account.id === activeAccount.id)?.rank || "-"
    : "-";
  const levelStats = getLevelStats(activeStats.totalPoints);
  const proposals = appState.customProposals || [];
  const activityRequests = appState.activityRequests || [];
  const approvedActivities = appState.approvedActivities || [];
  const categorySuggestions = [
    ...SUGGESTIONS[selectedCategory].map((item) => ({ ...item, category: selectedCategory })),
    ...approvedActivities.filter((item) => item.category === selectedCategory),
  ].map((item) => localizeActivityForLanguage(item, language));

  useEffect(() => {
    if (!hasHydratedState) {
      return;
    }

    const items = buildCatalogItems(approvedActivities);
    upsertActivityCatalog({ items }).catch((error) => {
      console.error("Konnte Aktivitätskatalog nicht synchronisieren.", error);
    });
  }, [approvedActivities, hasHydratedState, upsertActivityCatalog]);

  function updateAppState(updater) {
    setAppState((current) => (typeof updater === "function" ? updater(current) : updater));
  }

  function upsertAccountFromUser(current, user) {
    const mapped = mapUserToAccount(user);
    const existing = current.accounts.find((account) => account.id === mapped.id);
    const merged = existing ? { ...existing, ...mapped } : mapped;

    return {
      ...current,
      accounts: existing
        ? current.accounts.map((account) => (account.id === merged.id ? merged : account))
        : [...current.accounts, merged],
      activeAccountId: merged.id,
    };
  }

  async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const city = String(formData.get("city") || "").trim();
    const age = String(formData.get("age") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!name || !email || !city || !age || password.length < 4) {
      setStatus(copy.status.fillAll);
      return;
    }

    try {
      const result = await registerUser({ name, email, city, age, password });
      if (!result?.ok) {
        if (result?.reason === "account_exists") {
          setStatus(copy.status.accountExists);
          return;
        }
        setStatus(copy.status.genericError);
        return;
      }

      updateAppState((current) => upsertAccountFromUser(current, result.user));
      event.currentTarget.reset();
      setView("sustainability");
      setStatus(copy.status.registerWelcome(result.user.name));
    } catch (error) {
      console.error("Registrierung fehlgeschlagen.", error);
      setStatus(copy.status.genericError);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setStatus(copy.status.fillAll);
      return;
    }

    try {
      const result = await loginUser({ email, password });
      if (!result?.ok) {
        if (result?.reason === "email_incorrect") {
          setStatus(copy.status.accountMissing);
          return;
        }
        setStatus(copy.status.wrongPassword);
        return;
      }

      updateAppState((current) => upsertAccountFromUser(current, result.user));
      event.currentTarget.reset();
      setView("sustainability");
      setStatus(copy.status.welcomeBack(result.user.name));
    } catch (error) {
      console.error("Login fehlgeschlagen.", error);
      setStatus(copy.status.genericError);
    }
  }

  function handleLogout() {
    updateAppState((current) => ({
      ...current,
      activeAccountId: null,
    }));

    setObserverMode(false);
    setStoredSessionView(null);
    setView("sustainability");
    setStatus(copy.status.loggedOut);
  }

  function handleObserverAccess() {
    setObserverMode(true);
    setView("dashboard");
    setStatus(copy.status.signedIn);
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();
    if (!activeAccount || !activeAccount.backendUserId) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const city = String(formData.get("city") || "").trim();
    const age = String(formData.get("age") || "").trim();

    if (!name || !email || !city || !age) {
      setStatus(copy.status.fillAll);
      return;
    }

    try {
      const result = await updateUserProfile({
        userId: activeAccount.backendUserId,
        name,
        email,
        city,
        age,
      });
      if (!result?.ok) {
        if (result?.reason === "account_exists") {
          setStatus(copy.status.accountExists);
          return;
        }
        setStatus(copy.status.genericError);
        return;
      }

      updateAppState((current) => upsertAccountFromUser(current, result.user));
      setStatus(copy.status.profileUpdated);
    } catch (error) {
      console.error("Profil-Update fehlgeschlagen.", error);
      setStatus(copy.status.genericError);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (!activeAccount || !activeAccount.backendUserId) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") || "").trim();
    const nextPassword = String(formData.get("newPassword") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    if (nextPassword.length < 4) {
      setStatus(copy.status.passwordTooShort);
      return;
    }

    if (nextPassword !== confirmPassword) {
      setStatus(copy.status.passwordMismatch);
      return;
    }

    try {
      const result = await changeUserPassword({
        userId: activeAccount.backendUserId,
        currentPassword,
        newPassword: nextPassword,
      });
      if (!result?.ok) {
        if (result?.reason === "current_password_wrong") {
          setStatus(copy.status.currentPasswordWrong);
          return;
        }
        setStatus(copy.status.genericError);
        return;
      }

      updateAppState((current) => upsertAccountFromUser(current, result.user));
      event.currentTarget.reset();
      setStatus(copy.status.passwordChanged);
    } catch (error) {
      console.error("Passwort-Update fehlgeschlagen.", error);
      setStatus(copy.status.genericError);
    }
  }

  async function handleDeleteAccount() {
    if (!activeAccount || !activeAccount.backendUserId) {
      return;
    }

    try {
      const result = await deleteUser({ userId: activeAccount.backendUserId });
      if (!result?.ok) {
        setStatus(copy.status.genericError);
        return;
      }

      updateAppState((current) => ({
        ...current,
        accounts: current.accounts.filter((account) => account.id !== current.activeAccountId),
        activeAccountId: null,
        chatMessages: (current.chatMessages || []).filter(
          (entry) => entry.accountId !== current.activeAccountId,
        ),
        customProposals: (current.customProposals || []).filter(
          (proposal) => proposal.createdBy !== current.activeAccountId,
        ),
        activityRequests: (current.activityRequests || []).filter(
          (request) => request.createdBy !== current.activeAccountId,
        ),
      }));

      setView("sustainability");
      setStatus(copy.status.accountDeleted);
    } catch (error) {
      console.error("Account-Löschung fehlgeschlagen.", error);
      setStatus(copy.status.genericError);
    }
  }

  async function handleExportExcel() {
    if (!activeAccount?.backendUserId) {
      setStatus(copy.status.exportRequiresAccount);
      return;
    }

    if (convexActivityEntries === undefined) {
      setStatus(copy.status.exportLoading);
      return;
    }

    if (filteredUserExportEntries === null) {
      setStatus(copy.status.exportDateRangeInvalid);
      return;
    }

    if (!filteredUserExportEntries.length) {
      setStatus(copy.status.exportNoData);
      return;
    }

    setIsExportingExcel(true);
    setStatus(copy.dashboard.exportLoading);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const exportData = buildActivityExportWorkbook({
        entries: filteredUserExportEntries,
        account: activeAccount,
        language,
      });

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.summaryRows),
        exportData.sheetNames.summary,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.categoryRows),
        exportData.sheetNames.categories,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.monthRows),
        exportData.sheetNames.months,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.entryRows),
        exportData.sheetNames.entries,
      );

      XLSX.writeFile(workbook, buildExcelFilename(activeAccount.name));
      setStatus(copy.status.exportSuccess(filteredUserExportEntries.length));
    } catch (error) {
      console.error("Excel-Export fehlgeschlagen.", error);
      setStatus(copy.status.exportError);
    } finally {
      setIsExportingExcel(false);
    }
  }

  async function handleExportAllExcel() {
    if (convexUsers === undefined || convexAllActivityEntries === undefined) {
      setStatus(copy.status.exportAdminLoading);
      return;
    }

    if (filteredAdminExportEntries === null) {
      setStatus(copy.status.exportDateRangeInvalid);
      return;
    }

    if (!filteredAdminExportEntries.length) {
      setStatus(copy.status.exportNoData);
      return;
    }

    setIsExportingAllExcel(true);
    setStatus(copy.dashboard.exportAllLoading);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const exportData = buildCommunityExportWorkbook({
        users: convexUsers,
        entries: filteredAdminExportEntries,
        language,
      });

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.summaryRows),
        exportData.sheetNames.summary,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.userRows),
        exportData.sheetNames.users,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.categoryRows),
        exportData.sheetNames.categories,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.monthRows),
        exportData.sheetNames.months,
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(exportData.entryRows),
        exportData.sheetNames.entries,
      );

      XLSX.writeFile(workbook, buildCommunityExcelFilename());
      setStatus(copy.status.exportAllSuccess(filteredAdminExportEntries.length, convexUsers.length));
    } catch (error) {
      console.error("Admin-Export fehlgeschlagen.", error);
      setStatus(copy.status.exportError);
    } finally {
      setIsExportingAllExcel(false);
    }
  }

  if (!hasHydratedState) {
    return (
      <div className="auth-shell">
        <section className="auth-stage">
          <div className="auth-copy">
            <p className="eyebrow">EcoTrack</p>
            <h1>{copy.auth.title}</h1>
            <p className="auth-text">{copy.auth.loading}</p>
          </div>
        </section>
        <ImprintFooter copy={copy} />
      </div>
    );
  }

  function appendChatEntry(current, message) {
    const entry = {
      id: crypto.randomUUID(),
      accountId: activeAccount?.id || "system",
      author: restoreGermanUmlauts(activeAccount?.name || "System"),
      message: restoreGermanUmlauts(message),
      createdAt: new Date().toISOString(),
    };

    return [entry, ...(current.chatMessages || [])].slice(0, 80);
  }

  function syncEntriesToConvex(entries) {
    if (!activeAccount?.backendUserId || !entries.length) {
      return;
    }

    addActivityEntries({
      userId: activeAccount.backendUserId,
      entries: entries.map((entry) => ({
        category: entry.category,
        title: entry.title,
        points: entry.points,
        note: entry.note || "",
        createdAt: new Date(entry.createdAt).getTime(),
      })),
    }).catch((error) => {
      console.error("Konnte Aktivitäts-Einträge nicht in Convex speichern.", error);
    });
  }

  function addActivity(activity) {
    if (!activeAccount) {
      setStatus(copy.status.pleaseLogin);
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      category: activity.category,
      title: restoreGermanUmlauts(activity.title),
      points: activity.points,
      note: restoreGermanUmlauts(activity.note || ""),
      createdAt: new Date().toISOString(),
    };

    updateAppState((current) => ({
      ...current,
      accounts: current.accounts.map((account) => {
        if (account.id !== current.activeAccountId) {
          return account;
        }

        return {
          ...account,
          activities: [entry, ...account.activities],
        };
      }),
    }));
    syncEntriesToConvex([entry]);

    setStatus(copy.status.activityAdded(entry.title, entry.points));
  }

  function addActivities(activities) {
    if (!activeAccount || !activities.length) {
      if (!activeAccount) {
        setStatus(copy.status.pleaseLogin);
      }
      return;
    }

    const entries = activities.map((activity) => ({
      id: crypto.randomUUID(),
      category: activity.category,
      title: restoreGermanUmlauts(activity.title),
      points: activity.points,
      note: restoreGermanUmlauts(activity.note || ""),
      createdAt: new Date().toISOString(),
    }));

    updateAppState((current) => ({
      ...current,
      accounts: current.accounts.map((account) => {
        if (account.id !== current.activeAccountId) {
          return account;
        }

        return {
          ...account,
          activities: [...entries, ...account.activities],
        };
      }),
    }));
    syncEntriesToConvex(entries);

    const totalPoints = entries.reduce((sum, item) => sum + item.points, 0);
    setPendingActivities([]);
    setStatus(copy.status.activitiesAdded(entries.length, totalPoints));
  }

  function handlePresetActivity(item) {
    const queueItem = {
      id: crypto.randomUUID(),
      category: selectedCategory,
      title: restoreGermanUmlauts(item.title),
      points: item.points,
      note: restoreGermanUmlauts(item.note),
    };

    setPendingActivities((current) => [...current, queueItem]);
  }

  function handleSavePendingActivities() {
    addActivities(pendingActivities);
  }

  function handleClearPendingActivities() {
    setPendingActivities([]);
  }

  function handleRemovePendingActivity(activityToRemove) {
    setPendingActivities((current) =>
      current.filter((entry) => entry.id !== activityToRemove.id),
    );
  }

  function submitActivityRequest(category, title, points) {
    const normalizedTitle = restoreGermanUmlauts(title);
    const normalizedCreatorName = restoreGermanUmlauts(activeAccount.name);

    updateAppState((current) => ({
      ...current,
      activityRequests: [
        {
          id: crypto.randomUUID(),
          category,
          title: normalizedTitle,
          proposedPoints: points,
          createdBy: current.activeAccountId,
          createdByName: normalizedCreatorName,
          createdAt: new Date().toISOString(),
        },
        ...(current.activityRequests || []),
      ].slice(0, 40),
    }));

    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(`EcoTrack Vorschlag: ${normalizedTitle}`);
      const body = encodeURIComponent(
        `Neuer Aktivitätsvorschlag für EcoTrack\n\nKategorie: ${getCategoryLabel(category, "de")}\nAktivität: ${normalizedTitle}\nVorgeschlagene Punkte: ${points}\nEingereicht von: ${normalizedCreatorName} (${activeAccount.email})`,
      );
      window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
    }

    setStatus(
      `${copy.status.requestSubmitted(normalizedTitle)} ${copy.status.developerMailOpened(normalizedTitle)}`,
    );
  }

  function handleSubmitActivityRequest(event) {
    event.preventDefault();

    const title = restoreGermanUmlauts(requestTitle.trim());
    const points = Number(requestPoints);

    if (!title || Number.isNaN(points) || points < 1) {
      setStatus(copy.status.customInvalid);
      return;
    }

    submitActivityRequest(selectedCategory, title, points);
    setRequestTitle("");
    setRequestPoints("");
  }

  function handleSubmitFeedback(event) {
    event.preventDefault();
    if (!activeAccount) {
      setStatus(copy.status.pleaseLogin);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const suggestion = restoreGermanUmlauts(String(formData.get("suggestion") || "").trim());
    const category = String(formData.get("category") || "").trim() || "mobility";

    if (!suggestion) {
      setStatus(copy.status.fillAll);
      return;
    }

    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(
        `EcoTrack Verbesserungsvorschlag von ${restoreGermanUmlauts(activeAccount.name)}`,
      );
      const body = encodeURIComponent(
        `Verbesserungsvorschlag für EcoTrack\n\nUser-Name: ${restoreGermanUmlauts(activeAccount.name)}\nE-Mail: ${activeAccount.email}\nBereich: ${getFeedbackCategoryLabel(category, "de", COPY.de)}\n\nVorschlag:\n${suggestion}`,
      );
      window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
    }

    event.currentTarget.reset();
    setFeedbackCategory("general");
    setStatus(copy.status.feedbackSent);
  }

  function handleCreateProposal(event) {
    event.preventDefault();
    if (!activeAccount) {
      setStatus(copy.status.pleaseLogin);
      return;
    }

    const title = restoreGermanUmlauts(proposalTitle.trim());
    const points = Number(proposalPoints);

    if (!title || Number.isNaN(points) || points < 1) {
      setStatus(copy.status.customInvalid);
      return;
    }

    updateAppState((current) => {
      const proposal = {
        id: crypto.randomUUID(),
        createdBy: current.activeAccountId,
        createdByName: restoreGermanUmlauts(activeAccount.name),
        category: proposalCategory,
        title,
        proposedPoints: points,
        createdAt: new Date().toISOString(),
        votes: {},
      };

      return {
        ...current,
        customProposals: [proposal, ...(current.customProposals || [])].slice(0, 40),
        chatMessages: appendChatEntry(
          current,
          `${getCategoryLabel(proposalCategory, language)}: ${copy.status.customProposal(title, points)}`,
        ),
      };
    });

    setProposalTitle("");
    setProposalPoints("");
    setProposalCategory("mobility");
    setStatus(copy.status.requestSubmitted(title));
  }

  function handleReviewActivityRequest(requestId, decision) {
    const request = activityRequests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    updateAppState((current) => {
      const remainingRequests = (current.activityRequests || []).filter((item) => item.id !== requestId);

      if (decision === "approve") {
        return {
          ...current,
          activityRequests: remainingRequests,
          approvedActivities: [
            {
              id: crypto.randomUUID(),
              category: request.category,
              title: request.title,
              points: request.proposedPoints,
              note: current.activeAccountId === request.createdBy ? copy.status.customNote : "",
            },
            ...(current.approvedActivities || []),
          ].slice(0, 80),
        };
      }

      return {
        ...current,
        activityRequests: remainingRequests,
      };
    });

    setStatus(
      decision === "approve"
        ? copy.status.requestApproved(request.title)
        : copy.status.requestRejected(request.title),
    );
  }

  function handleSendChat(event) {
    event.preventDefault();
    const text = chatMessage.trim();

    if (!text || !activeAccount) {
      return;
    }

    updateAppState((current) => ({
      ...current,
      chatMessages: appendChatEntry(current, text),
    }));

    setChatMessage("");
    setStatus(copy.status.messageSent);
  }

  function handleVoteOnProposal(proposalId, points) {
    if (!activeAccount) {
      return;
    }

    updateAppState((current) => ({
      ...current,
      customProposals: (current.customProposals || []).map((proposal) => {
        if (proposal.id !== proposalId) {
          return proposal;
        }

        return {
          ...proposal,
          votes: {
            ...(proposal.votes || {}),
            [current.activeAccountId]: points,
          },
        };
      }),
    }));

    setStatus(copy.status.voteSaved(points));
  }

  function handleDeleteChatMessage(messageId) {
    if (!activeAccount) {
      return;
    }

    updateAppState((current) => ({
      ...current,
      chatMessages: (current.chatMessages || []).filter((entry) => {
        if (entry.id !== messageId) {
          return true;
        }

        return entry.accountId !== current.activeAccountId;
      }),
    }));

    setStatus(copy.status.messageDeleted);
  }

  function handleProposalReaction(proposal, reaction) {
    if (!activeAccount) {
      return;
    }

    if (reaction === "approve") {
      updateAppState((current) => ({
        ...current,
        customProposals: (current.customProposals || []).map((item) => {
          if (item.id !== proposal.id) {
            return item;
          }

          return {
            ...item,
            votes: {
              ...(item.votes || {}),
              [current.activeAccountId]: proposal.proposedPoints,
            },
          };
        }),
        chatMessages: appendChatEntry(current, copy.status.proposalApproved(proposal.title)),
      }));

      setStatus(copy.status.proposalApproved(proposal.title));
      return;
    }

    updateAppState((current) => ({
      ...current,
      customProposals: (current.customProposals || []).map((item) => {
        if (item.id !== proposal.id) {
          return item;
        }

        return {
          ...item,
          votes: {
            ...(item.votes || {}),
            [current.activeAccountId]: 0,
          },
        };
      }),
      chatMessages: appendChatEntry(current, copy.status.proposalRejected(proposal.title)),
    }));

    setStatus(copy.status.proposalRejected(proposal.title));
  }

  if (!sessionAccount) {
    return (
      <div className="auth-shell">
        <section className="auth-stage">
          <div className="auth-copy">
            <p className="eyebrow" onDoubleClick={handleObserverAccess}>
              EcoTrack
            </p>
            <h1>{copy.auth.title}</h1>
            <p className="auth-text">{copy.auth.text}</p>
            <div className="language-block">
              <p className="language-label">{copy.auth.language}</p>
              <div className="auth-pill-row language-row">
                <button
                  type="button"
                  className={`pill-button${language === "de" ? " active" : ""}`}
                  onClick={() => {
                    setLanguage("de");
                    setStatus(COPY.de.status.loginFirst);
                  }}
                >
                  Deutsch
                </button>
                <button
                  type="button"
                  className={`pill-button${language === "en" ? " active" : ""}`}
                  onClick={() => {
                    setLanguage("en");
                    setStatus(COPY.en.status.loginFirst);
                  }}
                >
                  English
                </button>
              </div>
            </div>
            <div className="auth-pill-row">
              <button
                type="button"
                className={`pill-button${authMode === "register" ? " active" : ""}`}
                onClick={() => setAuthMode("register")}
              >
                {copy.auth.register}
              </button>
              <button
                type="button"
                className={`pill-button${authMode === "login" ? " active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                {copy.auth.login}
              </button>
            </div>
          </div>

          <div className="auth-card">
            {authMode === "register" ? (
              <form className="stack" onSubmit={handleRegister} noValidate>
                <label>
                  <span className="field-label">{copy.auth.fullName}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input name="name" type="text" maxLength="40" required />
                </label>
                <label>
                  <span className="field-label">{copy.auth.email}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input name="email" type="email" maxLength="80" required />
                </label>
                <label>
                  <span className="field-label">{copy.auth.city}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input name="city" type="text" maxLength="40" required />
                </label>
                <label>
                  <span className="field-label">{copy.auth.age}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input name="age" type="number" min="0" max="99" required />
                </label>
                <label>
                  <span className="field-label">{copy.auth.password}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength="4"
                    maxLength="40"
                    required
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                  />
                  <span>{copy.auth.showPassword}</span>
                </label>
                <button type="submit" className="primary-button">
                  {copy.auth.continue}
                </button>
              </form>
            ) : (
              <form className="stack" onSubmit={handleLogin} noValidate>
                <label>
                  <span className="field-label">{copy.auth.email}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input name="email" type="email" maxLength="80" required />
                </label>
                <label>
                  <span className="field-label">{copy.auth.password}<RequiredHint text={copy.auth.requiredField} /></span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength="4"
                    maxLength="40"
                    required
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                  />
                  <span>{copy.auth.showPassword}</span>
                </label>
                <button type="submit" className="primary-button">
                  {copy.auth.signIn}
                </button>
              </form>
            )}
            <p className="status-message auth-status">{status}</p>
          </div>
        </section>
        <ImprintFooter copy={copy} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark">
            <img className="brand-logo" src={withBasePath("/ecotrack-logo.svg")} alt="EcoTrack Logo" />
            <p className="eyebrow">EcoTrack</p>
          </div>
          <h1>{copy.headerTitle}</h1>
        </div>

        <div className="header-right">
          <div className="login-state">
            {copy.loggedInAs}<strong className="login-name">{sessionAccount.name}</strong>
          </div>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            {copy.logout}
          </button>
        </div>
      </header>

      <nav className="top-nav" aria-label="Hauptnavigation">
        <div className="top-nav-group">
          {Object.entries(copy.primaryViewLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`nav-button${view === key ? " active" : ""}`}
              onClick={() => setView(key)}
            >
              <span className="button-with-icon">
                <IconSymbol name={VIEW_ICONS[key]} />
                <span className="button-label">{label}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="top-nav-group top-nav-group-right">
          <button
            type="button"
            className={`nav-button${view === "settings" ? " active" : ""}`}
            onClick={() => setView("settings")}
          >
            <span className="button-with-icon">
              <IconSymbol name={VIEW_ICONS.settings} />
              <span className="button-label">{copy.settings.navLabel}</span>
            </span>
          </button>
          <button
            type="button"
            className={`nav-button${view === "feedback" ? " active" : ""}`}
            onClick={() => setView("feedback")}
          >
            <span className="button-with-icon">
              <IconSymbol name={VIEW_ICONS.feedback} />
              <span className="button-label">{copy.feedback.navLabel}</span>
            </span>
          </button>
          <button
            type="button"
            className={`nav-button${view === "survey" ? " active" : ""}`}
            onClick={() => setView("survey")}
          >
            <span className="button-with-icon">
              <IconSymbol name={VIEW_ICONS.survey} />
              <span className="button-label">{copy.survey.navLabel}</span>
            </span>
          </button>
        </div>
      </nav>

      <main className="content-stack">
        {view === "sustainability" && <SustainabilityPanel copy={copy} />}

        {view === "activity" && (
          <ActivityPanel
            activeAccount={sessionAccount}
            stats={activeStats}
            levelStats={levelStats}
            language={language}
            copy={copy}
            pendingActivities={pendingActivities}
            categorySuggestions={categorySuggestions}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            handlePresetActivity={handlePresetActivity}
            handleSavePendingActivities={handleSavePendingActivities}
            handleClearPendingActivities={handleClearPendingActivities}
            handleRemovePendingActivity={handleRemovePendingActivity}
            handleSubmitActivityRequest={handleSubmitActivityRequest}
            requestTitle={requestTitle}
            setRequestTitle={setRequestTitle}
            requestPoints={requestPoints}
            setRequestPoints={setRequestPoints}
            setView={setView}
            status={status}
          />
        )}

        {view === "dashboard" && (
          <DashboardPanel
            account={sessionAccount}
            stats={activeStats}
            copy={copy}
            language={language}
            activityRequests={activityRequests}
            handleReviewActivityRequest={handleReviewActivityRequest}
            rank={activeRank}
            communityCount={appState.accounts.length}
            status={status}
            canExport={Boolean(activeAccount?.backendUserId)}
            isExportingExcel={isExportingExcel}
            canAdminExport={canAdminExport}
            isExportingAllExcel={isExportingAllExcel}
            exportRangePreset={exportRangePreset}
            exportDateFrom={exportDateFrom}
            exportDateTo={exportDateTo}
            selectedExportRangeLabel={selectedExportRangeLabel}
            filteredUserExportCount={Array.isArray(filteredUserExportEntries) ? filteredUserExportEntries.length : 0}
            filteredAdminExportCount={Array.isArray(filteredAdminExportEntries) ? filteredAdminExportEntries.length : 0}
            adminUserCount={Array.isArray(convexUsers) ? convexUsers.length : 0}
            setExportRangePreset={setExportRangePreset}
            setExportDateFrom={setExportDateFrom}
            setExportDateTo={setExportDateTo}
            handleExportExcel={handleExportExcel}
            handleExportAllExcel={handleExportAllExcel}
            setView={setView}
          />
        )}

        {view === "leaderboard" && (
          <LeaderboardPanel
            leaderboard={leaderboard}
            copy={copy}
            activeAccountId={appState.activeAccountId}
            setView={setView}
          />
        )}

        {view === "chat" && (
          <ChatPanel
            activeAccount={sessionAccount}
            language={language}
            copy={copy}
            chatMessages={appState.chatMessages || []}
            proposals={proposals}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            proposalTitle={proposalTitle}
            setProposalTitle={setProposalTitle}
            proposalPoints={proposalPoints}
            setProposalPoints={setProposalPoints}
            proposalCategory={proposalCategory}
            setProposalCategory={setProposalCategory}
            handleSendChat={handleSendChat}
            handleCreateProposal={handleCreateProposal}
            handleVoteOnProposal={handleVoteOnProposal}
            handleProposalReaction={handleProposalReaction}
            handleDeleteChatMessage={handleDeleteChatMessage}
          />
        )}

        {view === "settings" && (
          <SettingsPanel
            account={sessionAccount}
            copy={copy}
            language={language}
            setLanguage={setLanguage}
            handleUpdateProfile={handleUpdateProfile}
            handleChangePassword={handleChangePassword}
            handleDeleteAccount={handleDeleteAccount}
          />
        )}

        {view === "feedback" && (
          <FeedbackPanel
            account={sessionAccount}
            copy={copy}
            language={language}
            feedbackCategory={feedbackCategory}
            setFeedbackCategory={setFeedbackCategory}
            handleSubmitFeedback={handleSubmitFeedback}
          />
        )}

        {view === "survey" && <SurveyPanel copy={copy} />}
      </main>
      <ImprintFooter copy={copy} />
    </div>
  );
}

function SustainabilityPanel({ copy }) {
  return (
    <section className="panel info-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.sustainability.eyebrow}</p>
          <h2>{copy.sustainability.title}</h2>
        </div>
      </div>

      <div className="info-grid">
        <article className="info-card feature-card">
          <h3>{copy.sustainability.goalTitle}</h3>
          <p>{copy.sustainability.goalBody}</p>
          <div className="goal-visual" aria-hidden="true">
            <img className="feature-image feature-leaf" src={withBasePath("/monstera-blatt-l.jpg")} alt="" draggable={false} />
          </div>
        </article>
        <article className="info-card feature-card">
          <h3>{copy.sustainability.backgroundTitle}</h3>
          <p>{copy.sustainability.backgroundBody}</p>
          <div className="goal-visual" aria-hidden="true">
            <img
              className="feature-image feature-community"
              src={withBasePath("/Nachhaltigkeits_Community.jpeg")}
              alt=""
              draggable={false}
            />
          </div>
        </article>
        <article className="info-card student-card">
          <h3>{copy.sustainability.projectTitle}</h3>
          <p>{copy.sustainability.projectBody}</p>
          <StudentPhoto copy={copy} />
        </article>
      </div>
    </section>
  );
}

function IconSymbol({ name }) {
  const icons = {
    leaf: (
      <path d="M18 4C11.5 4.2 7.2 8 6.3 13c-.7 4.1 1.5 6.7 4.9 6.7 5.9 0 8.8-5.4 8.8-12.2V4Zm-2.2 4.6c-3.1 1.4-5.4 3.8-6.9 7.2" />
    ),
    spark: (
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    ),
    chat: (
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v5A2.5 2.5 0 0 1 16.5 14H11l-3.8 3v-3H7.5A2.5 2.5 0 0 1 5 11.5v-5Z" />
    ),
    settings: (
      <>
        <path d="M6 6h12M6 12h12M6 18h12" />
        <path d="M9 4.5v3M15 10.5v3M11 16.5v3" />
      </>
    ),
    feedback: (
      <>
        <path d="M12 4v10" />
        <path d="M8.4 8.4A4.6 4.6 0 1 1 15.6 8.4" />
        <path d="M9.2 18h5.6" />
        <path d="M10 21h4" />
      </>
    ),
    survey: (
      <>
        <path d="M8 5.5h8" />
        <path d="M8 10h8" />
        <path d="M8 14.5h5" />
        <path d="M6.5 4h11A1.5 1.5 0 0 1 19 5.5v13A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4Z" />
      </>
    ),
    mobility: (
      <path d="M7 15.5a1.8 1.8 0 1 0 0 .1Zm10 0a1.8 1.8 0 1 0 0 .1ZM8.8 15.5h2.5l2.5-5h2.3l1.5 2.8m-8.6 2.2 2.2-4h3.1m-6.8 0-1.5-3h3.5l2.1 3" />
    ),
    nutrition: (
      <path d="M12 5c2.8 0 5 2 5 4.6 0 3.8-5 8.4-5 8.4S7 13.4 7 9.6C7 7 9.2 5 12 5Zm0-2v18" />
    ),
    household: (
      <path d="m4.5 10 7.5-6 7.5 6M7 8.6V19h10V8.6M10 19v-5h4v5" />
    ),
    custom: (
      <path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" />
    ),
  };

  return (
    <span className="button-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[name] || icons.spark}
      </svg>
    </span>
  );
}

function StudentPhoto({ copy }) {
  const photoCandidates = [
    withBasePath("/student-team.jpg"),
    withBasePath("/student-team.jpeg"),
    withBasePath("/student-team.png"),
  ];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [hasImage, setHasImage] = useState(true);

  function handleImageError() {
    if (photoIndex < photoCandidates.length - 1) {
      setPhotoIndex((current) => current + 1);
      return;
    }

    setHasImage(false);
  }

  return (
    <div className="student-photo-wrap">
      {hasImage ? (
        <img
          className="student-photo"
          src={photoCandidates[photoIndex]}
          alt="Jens und David am See"
          onError={handleImageError}
          draggable={false}
        />
      ) : (
        <div className="student-photo-placeholder">
          <p className="eyebrow">Teamfoto</p>
          <h4>{copy.sustainability.photoMissingTitle}</h4>
          <p>{copy.sustainability.photoMissingBody}</p>
        </div>
      )}
    </div>
  );
}

function ActivityPanel({
  activeAccount,
  stats,
  levelStats,
  language,
  copy,
  pendingActivities,
  categorySuggestions,
  selectedCategory,
  setSelectedCategory,
  handlePresetActivity,
  handleSavePendingActivities,
  handleClearPendingActivities,
  handleRemovePendingActivity,
  handleSubmitActivityRequest,
  requestTitle,
  setRequestTitle,
  requestPoints,
  setRequestPoints,
  setView,
  status,
}) {
  const suggestions = categorySuggestions;
  const pendingTotalPoints = pendingActivities.reduce((sum, item) => sum + item.points, 0);
  const [treePreviewMode, setTreePreviewMode] = useState("off");
  const parsedCurrentPoints = parsePointValue(stats.totalPoints);
  const previewTargetPoints = treePreviewMode === "full"
    ? Math.max(5000, parsedCurrentPoints)
    : Math.max(1800, parsedCurrentPoints);
  const displayedLevelStats = treePreviewMode === "off" ? levelStats : getLevelStats(previewTargetPoints);

  return (
    <section className="panel activity-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.activity.eyebrow}</p>
          <h2>{copy.activity.title}</h2>
        </div>
        <UtilityNav activeView="activity" setView={setView} copy={copy} />
      </div>

      <section className="level-panel" aria-label="Level-Anzeige">
        <div className="level-layout">
          <div className="level-copy-block">
            <div className="level-head">
              <div>
                <p className="eyebrow">{copy.activity.level}</p>
                <h3 className="subhead">
                  {activeAccount.name}: {copy.activity.level} {displayedLevelStats.level}
                </h3>
              </div>
              <p className="level-points">{stats.totalPoints} {copy.dashboard.points}</p>
            </div>
            <p className="level-copy">
              {copy.activity.levelProgress(
                displayedLevelStats.pointsToNext,
                displayedLevelStats.nextLabel,
                displayedLevelStats.nextThreshold,
              )}
            </p>
            <div className="level-track" aria-label="Fortschritt zum nächsten Level">
              <div className="level-fill" style={{ width: `${displayedLevelStats.progressPercent}%` }} />
            </div>
            <div className="level-meta">
              <p>{displayedLevelStats.progressPercent}% {copy.activity.progress}</p>
              <p>{copy.activity.today}: {stats.dayTotal}</p>
              <p>{copy.activity.week}: {stats.weekTotal}</p>
            </div>
            {IS_DEV_BUILD ? (
              <div className="preview-actions">
                <button
                  type="button"
                  className="secondary-button small-button"
                  onClick={() =>
                    setTreePreviewMode((current) => (current === "fruit" ? "off" : "fruit"))
                  }
                >
                  {treePreviewMode === "fruit" ? "Frucht-Vorschau beenden" : "Baum mit Früchten anzeigen"}
                </button>
                <button
                  type="button"
                  className="secondary-button small-button"
                  onClick={() =>
                    setTreePreviewMode((current) => (current === "full" ? "off" : "full"))
                  }
                >
                  {treePreviewMode === "full" ? "Final-Vorschau beenden" : "Finalen Baum anzeigen"}
                </button>
              </div>
            ) : null}
          </div>
          <LevelTree
            levelStats={displayedLevelStats}
            copy={copy}
            variant={treePreviewMode === "full" ? "full" : "normal"}
          />
        </div>
      </section>

      <div className="category-row">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`category-button${selectedCategory === key ? " active" : ""}`}
            onClick={() => setSelectedCategory(key)}
          >
            <span className="button-with-icon">
              <IconSymbol name={CATEGORY_ICONS[key]} />
              <span className="button-label">{label[language]}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="batch-card">
        <div>
          <p className="eyebrow">{copy.activity.batchTitle}</p>
          <p className="batch-copy">
            {pendingActivities.length
              ? copy.activity.batchSelected(pendingActivities.length, pendingTotalPoints)
              : copy.activity.batchEmpty}
          </p>
          {pendingActivities.length ? (
            <div className="batch-list">
              {pendingActivities.map((item) => (
                <div key={item.id} className="batch-item">
                  <div className="batch-item-copy">
                    <strong>{item.title}</strong>
                    <span>
                      {getCategoryLabel(item.category, language)} • +{item.points}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="batch-remove"
                    onClick={() => handleRemovePendingActivity(item)}
                  >
                    {copy.activity.removeFromList}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="batch-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleClearPendingActivities}
            disabled={!pendingActivities.length}
          >
            {copy.activity.batchClear}
          </button>
          <button
            type="button"
            className="primary-button small-button"
            onClick={handleSavePendingActivities}
            disabled={!pendingActivities.length}
          >
            {copy.activity.batchSave}
          </button>
        </div>
      </div>

      {suggestions.length ? (
        <div className="suggestion-grid">
          {suggestions.map((item) => (
            <article
              key={item.title}
              className={`suggestion-card${
                pendingActivities.some(
                  (entry) => entry.category === selectedCategory && entry.title === item.title,
                )
                  ? " active-selection"
                  : ""
              }`}
            >
              <p className="suggestion-points">+{item.points}</p>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <button
                type="button"
                className="primary-button small-button"
                onClick={() => handlePresetActivity(item)}
              >
                {pendingActivities.some(
                  (entry) => entry.category === selectedCategory && entry.title === item.title,
                )
                  ? copy.activity.addAgain
                  : copy.activity.addToList}
              </button>
            </article>
          ))}
        </div>
      ) : null}

      <form className="custom-card request-card" onSubmit={handleSubmitActivityRequest}>
        <h3>{copy.activity.requestTitle}</h3>
        <label>
          {copy.activity.customLabel}
          <input
            type="text"
            value={requestTitle}
            onChange={(event) => setRequestTitle(event.target.value)}
            placeholder={copy.activity.requestPlaceholder}
            required
          />
        </label>
        <label>
          {copy.activity.customPoints}
          <input
            type="number"
            min="1"
            max="30"
            value={requestPoints}
            onChange={(event) => setRequestPoints(event.target.value)}
            placeholder={copy.activity.requestPointsPlaceholder}
            required
          />
        </label>
        <button type="submit" className="secondary-button small-button">
          {copy.activity.requestSubmit}
        </button>
      </form>

      <div className="activity-footer">
        <div>
          <p className="eyebrow">{copy.activity.recentlyActive}</p>
          <h3 className="subhead">{activeAccount.name}</h3>
        </div>
        <p className="status-message">{status}</p>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>{copy.activity.tableDate}</th>
              <th>{copy.activity.tableCategory}</th>
              <th>{copy.activity.tableActivity}</th>
              <th>{copy.activity.tablePoints}</th>
            </tr>
          </thead>
          <tbody>
            {activeAccount.activities.length ? (
              activeAccount.activities.slice(0, 6).map((activity) => (
                <tr key={activity.id}>
                  <td>{formatDate(activity.createdAt, language)}</td>
                  <td>{getCategoryLabel(activity.category, language)}</td>
                  <td>{activity.title}</td>
                  <td>+{activity.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">{copy.activity.noActivities}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LevelTree({ levelStats, copy }) {
  const growth = getTreeGrowth(levelStats, copy);

  return (
    <div className="level-tree-card" aria-label={copy.activity.treeTitle}>
      <p className="level-tree-label">{copy.activity.treeTitle}</p>
      <div className="level-tree-scene">
        <div className="tree-canopy canopy-back" style={growth.canopyBackStyle} />
        <div className="tree-canopy canopy-mid" style={growth.canopyMidStyle} />
        <div className="tree-canopy canopy-front" style={growth.canopyFrontStyle} />
        {growth.leafClusters.map((leaf) => (
          <span key={leaf.id} className="tree-leaf" style={leaf.style} />
        ))}
        {growth.fruits.map((fruit) => (
          <span key={fruit.id} className="tree-fruit" style={fruit.style} />
        ))}
        <div className="tree-trunk" style={growth.trunkStyle}>
          <div className="tree-branches" style={growth.branchStyle} />
        </div>
        <div className="tree-ground" />
        <div className="tree-roots" style={growth.rootStyle}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="level-tree-note">{growth.stageLabel}</p>
    </div>
  );
}

function DashboardPanel({
  account,
  stats,
  copy,
  language,
  activityRequests,
  handleReviewActivityRequest,
  rank,
  communityCount,
  status,
  canExport,
  isExportingExcel,
  canAdminExport,
  isExportingAllExcel,
  exportRangePreset,
  exportDateFrom,
  exportDateTo,
  selectedExportRangeLabel,
  filteredUserExportCount,
  filteredAdminExportCount,
  adminUserCount,
  setExportRangePreset,
  setExportDateFrom,
  setExportDateTo,
  handleExportExcel,
  handleExportAllExcel,
  setView,
}) {
  const periodRows = [
    { label: copy.dashboard.day, value: stats.dayTotal, detail: copy.dashboard.today },
    { label: copy.dashboard.week, value: stats.weekTotal, detail: copy.dashboard.weekDetail },
    { label: copy.dashboard.month, value: stats.monthTotal, detail: copy.dashboard.monthDetail },
  ];

  return (
    <section className="panel dashboard-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.dashboard.eyebrow}</p>
          <h2>{copy.dashboard.title(account.name)}</h2>
        </div>
        <div className="dashboard-head-actions">
          <div className="dashboard-export-stack">
            <div className="summary-chip">{copy.dashboard.rank(rank, communityCount)}</div>
            {canAdminExport ? (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleExportExcel}
                  disabled={!canExport || isExportingExcel}
                >
                  {isExportingExcel ? copy.dashboard.exportLoading : copy.dashboard.exportExcel}
                </button>
                <p className="dashboard-export-hint">{copy.dashboard.exportHint}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleExportAllExcel}
                  disabled={isExportingAllExcel}
                >
                  {isExportingAllExcel ? copy.dashboard.exportAllLoading : copy.dashboard.exportAllExcel}
                </button>
                <p className="dashboard-export-hint">{copy.dashboard.exportAllHint}</p>
              </>
            ) : null}
          </div>
          <UtilityNav activeView="dashboard" setView={setView} copy={copy} />
        </div>
      </div>

      <p className="status-message dashboard-status">{status}</p>

      {canAdminExport ? (
        <div className="custom-card export-filter-card">
          <div className="export-filter-head">
            <div>
              <p className="eyebrow">{copy.dashboard.exportFilterTitle}</p>
              <h3 className="subhead">{selectedExportRangeLabel}</h3>
            </div>
            <p className="dashboard-export-hint">
              {copy.dashboard.exportFilterActive(selectedExportRangeLabel, filteredAdminExportCount)}
            </p>
          </div>
          <div className="export-preview-grid">
            <article className="metric-card export-preview-card accent-card">
              <p className="metric-label">{copy.dashboard.exportPreviewTitle}</p>
              <p className="metric-value export-preview-mode">{copy.dashboard.exportPreviewModeAdmin}</p>
            </article>
            <article className="metric-card export-preview-card">
              <p className="metric-label">{copy.dashboard.exportPreviewEntries}</p>
              <p className="metric-value">{filteredAdminExportCount}</p>
            </article>
            <article className="metric-card export-preview-card">
              <p className="metric-label">{copy.dashboard.exportPreviewUsers}</p>
              <p className="metric-value">{adminUserCount}</p>
            </article>
          </div>
          <div className="export-filter-grid">
            <label>
              {copy.dashboard.exportFilterPreset}
              <div className="export-input-wrap">
                <span className="export-input-icon" aria-hidden="true">
                  <FieldIcon kind="select" />
                </span>
                <select
                  value={exportRangePreset}
                  onChange={(event) => setExportRangePreset(event.target.value)}
                >
                  <option value="all">{copy.dashboard.exportFilterAll}</option>
                  <option value="today">{copy.dashboard.exportFilterToday}</option>
                  <option value="7d">{copy.dashboard.exportFilter7Days}</option>
                  <option value="30d">{copy.dashboard.exportFilter30Days}</option>
                  <option value="90d">{copy.dashboard.exportFilter90Days}</option>
                  <option value="thisMonth">{copy.dashboard.exportFilterThisMonth}</option>
                  <option value="lastMonth">{copy.dashboard.exportFilterLastMonth}</option>
                  <option value="year">{copy.dashboard.exportFilterYear}</option>
                  <option value="custom">{copy.dashboard.exportFilterCustom}</option>
                </select>
              </div>
            </label>
            <label>
              {copy.dashboard.exportFilterFrom}
              <div className="export-input-wrap">
                <span className="export-input-icon" aria-hidden="true">
                  <FieldIcon kind="calendar" />
                </span>
                <input
                  type="date"
                  value={exportDateFrom}
                  onChange={(event) => {
                    setExportRangePreset("custom");
                    setExportDateFrom(event.target.value);
                  }}
                />
              </div>
            </label>
            <label>
              {copy.dashboard.exportFilterTo}
              <div className="export-input-wrap">
                <span className="export-input-icon" aria-hidden="true">
                  <FieldIcon kind="calendar" />
                </span>
                <input
                  type="date"
                  value={exportDateTo}
                  onChange={(event) => {
                    setExportRangePreset("custom");
                    setExportDateTo(event.target.value);
                  }}
                />
              </div>
            </label>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <article className="metric-card accent-card">
          <p className="metric-label">{copy.dashboard.today}</p>
          <p className="metric-value">{stats.dayTotal}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.dashboard.week}</p>
          <p className="metric-value">{stats.weekTotal}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.dashboard.month}</p>
          <p className="metric-value">{stats.monthTotal}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.dashboard.activities}</p>
          <p className="metric-value">{account.activities.length}</p>
        </article>
      </div>

      <div className="analytics-grid">
        <article className="chart-card">
          <div className="chart-head">
            <h3>{copy.dashboard.dailyChart}</h3>
            <p>{copy.dashboard.dailyRange}</p>
          </div>
          <BarChart items={stats.dailySeries} />
        </article>
        <article className="chart-card">
          <div className="chart-head">
            <h3>{copy.dashboard.weeklyChart}</h3>
            <p>{copy.dashboard.weeklyRange}</p>
          </div>
          <BarChart items={stats.weeklySeries} />
        </article>
        <article className="chart-card">
          <div className="chart-head">
            <h3>{copy.dashboard.monthlyChart}</h3>
            <p>{copy.dashboard.monthlyRange}</p>
          </div>
          <BarChart items={stats.monthlySeries} />
        </article>
      </div>

      <div className="table-layout">
        <div className="table-card">
          <h3 className="subhead">{copy.dashboard.statsTable}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>{copy.dashboard.period}</th>
                <th>{copy.dashboard.points}</th>
                <th>{copy.dashboard.details}</th>
              </tr>
            </thead>
            <tbody>
              {periodRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3 className="subhead">{copy.dashboard.categories}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>{copy.activity.tableCategory}</th>
                <th>{copy.dashboard.points}</th>
              </tr>
            </thead>
            <tbody>
              {stats.categoryRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canAdminExport ? (
        <div className="table-card">
          <h3 className="subhead">{copy.dashboard.developerReview}</h3>
          <p className="chat-note">{copy.dashboard.pendingRequests}</p>
          <div className="proposal-list">
            {activityRequests.length ? (
              activityRequests.map((request) => (
                <article key={request.id} className="proposal-card">
                  <div className="proposal-head">
                    <div>
                      <h4>{request.title}</h4>
                      <p>{request.createdByName}</p>
                    </div>
                    <div className="proposal-score">
                      <span>{getCategoryLabel(request.category, language)}</span>
                      <strong>{request.proposedPoints}</strong>
                    </div>
                  </div>
                  <div className="proposal-actions">
                    <button
                      type="button"
                      className="primary-button small-button"
                      onClick={() => handleReviewActivityRequest(request.id, "approve")}
                    >
                      {copy.dashboard.approve}
                    </button>
                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={() => handleReviewActivityRequest(request.id, "reject")}
                    >
                      {copy.dashboard.reject}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-note">{copy.dashboard.noRequests}</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FieldIcon({ kind }) {
  if (kind === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10l5 5 5-5" />
      <path d="M7 14l5 5 5-5" opacity="0" />
    </svg>
  );
}

function LeaderboardPanel({ leaderboard, copy, activeAccountId, setView }) {
  const compareItems = leaderboard.slice(0, 5).map((item) => ({
    label: item.account.name.split(" ")[0],
    value: item.stats.monthTotal,
  }));

  return (
    <section className="panel leaderboard-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.leaderboard.eyebrow}</p>
          <h2>{copy.leaderboard.title}</h2>
        </div>
        <UtilityNav activeView="leaderboard" setView={setView} copy={copy} />
      </div>

      <div className="leaderboard-top">
        {leaderboard.slice(0, 3).map((item) => (
          <article
            key={item.account.id}
            className={`podium-card${item.account.id === activeAccountId ? " active" : ""}`}
          >
            <p className="podium-rank">#{item.rank}</p>
            <h3>{item.account.name}</h3>
            <p className="podium-score">{item.stats.monthTotal} {copy.leaderboard.monthlyPoints}</p>
          </article>
        ))}
      </div>

      <div className="table-layout">
        <div className="table-card">
          <h3 className="subhead">{copy.leaderboard.rankingTable}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>{copy.leaderboard.rank}</th>
                <th>{copy.leaderboard.name}</th>
                <th>{copy.leaderboard.day}</th>
                <th>{copy.leaderboard.week}</th>
                <th>{copy.leaderboard.month}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length ? (
                leaderboard.map((item) => (
                  <tr key={item.account.id} className={item.account.id === activeAccountId ? "active-row" : ""}>
                    <td>#{item.rank}</td>
                    <td>{item.account.name}</td>
                    <td>{item.stats.dayTotal}</td>
                    <td>{item.stats.weekTotal}</td>
                    <td>{item.stats.monthTotal}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">{copy.leaderboard.noUsers}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <h3>{copy.leaderboard.monthCompare}</h3>
            <p>{copy.leaderboard.topUsers}</p>
          </div>
          <HorizontalChart items={compareItems} emptyLabel={copy.chat.noValues} />
        </div>
      </div>
    </section>
  );
}

function ChatPanel({
  activeAccount,
  language,
  copy,
  chatMessages,
  proposals,
  chatMessage,
  setChatMessage,
  proposalTitle,
  setProposalTitle,
  proposalPoints,
  setProposalPoints,
  proposalCategory,
  setProposalCategory,
  handleSendChat,
  handleCreateProposal,
  handleVoteOnProposal,
  handleProposalReaction,
  handleDeleteChatMessage,
}) {
  const visibleProposals = proposals.filter(
    (proposal) => !Object.prototype.hasOwnProperty.call(proposal.votes || {}, activeAccount.id),
  );

  return (
    <section className="panel chat-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.chat.eyebrow}</p>
          <h2>{copy.chat.title}</h2>
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-card">
          <h3 className="subhead">{copy.chat.chatTitle}</h3>
          <p className="chat-note">{copy.chat.chatBody}</p>
          <div className="message-list">
            {chatMessages.length ? (
              chatMessages.map((entry) => (
                <article
                  key={entry.id}
                  className={`message-item${entry.accountId === activeAccount.id ? " own-message" : ""}`}
                >
                  <div className="message-head">
                    <div className="message-meta">
                      <strong>{entry.author}</strong>
                      <span>{formatDateTime(entry.createdAt, language)}</span>
                    </div>
                    {entry.accountId === activeAccount.id ? (
                      <button
                        type="button"
                        className="message-delete"
                        onClick={() => handleDeleteChatMessage(entry.id)}
                      >
                        Loeschen
                      </button>
                    ) : null}
                  </div>
                  <p className="message-bubble">{entry.message}</p>
                </article>
              ))
            ) : (
              <p className="empty-note">{copy.chat.noMessages}</p>
            )}
          </div>

          <form className="chat-form" onSubmit={handleSendChat}>
            <input
              type="text"
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder={copy.chat.placeholder(activeAccount.name)}
              maxLength="200"
            />
            <button type="submit" className="primary-button small-button">
              {copy.chat.send}
            </button>
          </form>
        </div>

        <div className="chat-card">
          <h3 className="subhead">{copy.chat.proposalTitle}</h3>
          <p className="chat-note">{copy.chat.proposalBody}</p>
          <form className="custom-card proposal-create-card" onSubmit={handleCreateProposal}>
            <h4>{copy.chat.createTitle}</h4>
            <label>
              {copy.chat.createLabel}
              <input
                type="text"
                value={proposalTitle}
                onChange={(event) => setProposalTitle(event.target.value)}
                placeholder={copy.chat.createPlaceholder}
                maxLength="120"
                required
              />
            </label>
            <div className="proposal-create-grid">
              <label>
                {copy.chat.createPoints}
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={proposalPoints}
                  onChange={(event) => setProposalPoints(event.target.value)}
                  required
                />
              </label>
              <label>
                {copy.chat.createCategory}
                <select
                  value={proposalCategory}
                  onChange={(event) => setProposalCategory(event.target.value)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label[language]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className="primary-button small-button">
              {copy.chat.createButton}
            </button>
          </form>
          <div className="proposal-list">
            {visibleProposals.length ? (
              visibleProposals.map((proposal) => {
                const recommended = getProposalAverage(proposal);
                const selectedVote = proposal.votes?.[activeAccount.id];

                return (
                  <article key={proposal.id} className="proposal-card">
                    <div className="proposal-head">
                      <div>
                        <h4>{proposal.title}</h4>
                        <p>{copy.chat.fromOn(proposal.createdByName, formatDate(proposal.createdAt, language))}</p>
                      </div>
                      <div className="proposal-score">
                        <span>{copy.chat.suggestion}</span>
                        <strong>{proposal.proposedPoints}</strong>
                      </div>
                    </div>

                    <div className="proposal-meta">
                      <span>{copy.chat.communityValue}: {recommended}</span>
                      <span>{Object.keys(proposal.votes || {}).length} {copy.chat.votes}</span>
                    </div>

                    <div className="proposal-actions">
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => handleProposalReaction(proposal, "approve")}
                      >
                        {copy.chat.approve}
                      </button>
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => handleProposalReaction(proposal, "reject")}
                      >
                        {copy.chat.reject}
                      </button>
                    </div>

                    <div className="vote-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`vote-chip${selectedVote === value ? " active" : ""}`}
                          onClick={() => handleVoteOnProposal(proposal.id, value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="empty-note">{copy.chat.noProposals}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsPanel({
  account,
  copy,
  language,
  setLanguage,
  handleUpdateProfile,
  handleChangePassword,
  handleDeleteAccount,
}) {
  return (
    <section className="panel settings-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.settings.eyebrow}</p>
          <h2>{copy.settings.title}</h2>
        </div>
      </div>

      <div className="settings-grid">
        <form className="custom-card" onSubmit={handleUpdateProfile}>
          <h3>{copy.settings.profileTitle}</h3>
          <label>
            {copy.auth.fullName}
            <input name="name" type="text" defaultValue={account.name} maxLength="40" required />
          </label>
          <label>
            {copy.auth.email}
            <input name="email" type="email" defaultValue={account.email} maxLength="80" required />
          </label>
          <label>
            {copy.auth.city}
            <input name="city" type="text" defaultValue={account.city} maxLength="40" required />
          </label>
          <label>
            {copy.auth.age}
            <input name="age" type="number" min="0" max="99" defaultValue={account.age} required />
          </label>
          <button type="submit" className="primary-button small-button">
            {copy.settings.saveProfile}
          </button>
        </form>

        <div className="custom-card settings-stack-card">
          <div className="language-block settings-language-block">
            <p className="language-label">{copy.auth.language}</p>
            <div className="auth-pill-row language-row">
              <button
                type="button"
                className={`pill-button${language === "de" ? " active" : ""}`}
                onClick={() => {
                  setLanguage("de");
                  setStatus(COPY.de.status.signedIn);
                }}
              >
                Deutsch
              </button>
              <button
                type="button"
                className={`pill-button${language === "en" ? " active" : ""}`}
                onClick={() => {
                  setLanguage("en");
                  setStatus(COPY.en.status.signedIn);
                }}
              >
                English
              </button>
            </div>
          </div>

          <form className="stack" onSubmit={handleChangePassword}>
            <h3>{copy.settings.passwordTitle}</h3>
            <label>
              {copy.settings.currentPassword}
              <input name="currentPassword" type="password" minLength="4" maxLength="40" required />
            </label>
            <label>
              {copy.settings.newPassword}
              <input name="newPassword" type="password" minLength="4" maxLength="40" required />
            </label>
            <label>
              {copy.settings.confirmPassword}
              <input name="confirmPassword" type="password" minLength="4" maxLength="40" required />
            </label>
            <button type="submit" className="primary-button small-button">
              {copy.settings.changePassword}
            </button>
          </form>
        </div>
      </div>

      <div className="table-card danger-card">
        <h3 className="subhead">{copy.settings.deleteTitle}</h3>
        <p className="chat-note">{copy.settings.deleteText}</p>
        <button type="button" className="secondary-button" onClick={handleDeleteAccount}>
          {copy.settings.deleteButton}
        </button>
      </div>
    </section>
  );
}

function FeedbackPanel({
  account,
  copy,
  language,
  feedbackCategory,
  setFeedbackCategory,
  handleSubmitFeedback,
}) {
  return (
    <section className="panel settings-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.feedback.eyebrow}</p>
          <h2>{copy.feedback.title}</h2>
        </div>
      </div>

      <form className="custom-card feedback-card" onSubmit={handleSubmitFeedback}>
        <label>
          {copy.feedback.userLabel}
          <input type="text" value={account.name} readOnly />
        </label>
        <label>
          {copy.feedback.categoryLabel}
          <div className="category-row inline-category-row">
            {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`category-button${feedbackCategory === key ? " active" : ""}`}
                onClick={() => setFeedbackCategory(key)}
              >
                <span className="button-with-icon">
                  <IconSymbol name={CATEGORY_ICONS[key] || VIEW_ICONS.feedback} />
                  <span className="button-label">{label[language]}</span>
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="category" value={feedbackCategory} />
        </label>
        <label>
          {copy.feedback.suggestionLabel}
          <textarea
            name="suggestion"
            rows="6"
            maxLength="1500"
            placeholder={copy.feedback.suggestionPlaceholder}
            required
          />
        </label>
        <button type="submit" className="primary-button small-button">
          {copy.feedback.submit}
        </button>
      </form>
    </section>
  );
}

function SurveyPanel({ copy }) {
  function openSurvey() {
    if (typeof window !== "undefined") {
      window.open(SURVEY_URL, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className="panel settings-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{copy.survey.eyebrow}</p>
          <h2>{copy.survey.title}</h2>
        </div>
      </div>

      <div className="custom-card feedback-card survey-card">
        <p className="chat-note">{copy.survey.text}</p>
        <p className="survey-link">{copy.survey.linkLabel}: {SURVEY_URL}</p>
        <button type="button" className="primary-button small-button" onClick={openSurvey}>
          {copy.survey.button}
        </button>
      </div>
    </section>
  );
}

function openImprintWindow(copy) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(withBasePath("/impressum.html"), "_blank", "noopener,noreferrer");
}

function ImprintFooter({ copy }) {
  return (
    <footer className="app-footer">
      <button type="button" className="footer-link" onClick={() => openImprintWindow(copy)}>
        {copy.imprint.label}
      </button>
    </footer>
  );
}

function RequiredHint({ text }) {
  return <span className="required-hint" title={text} aria-label={text}>!</span>;
}

function BarChart({ items }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div key={item.label} className="bar-item">
          <span className="bar-value">{item.value}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${Math.max(10, Math.round((item.value / maxValue) * 140))}px` }}
            />
          </div>
          <span className="bar-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalChart({ items, emptyLabel = COPY.de.chat.noValues }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="horizontal-chart">
      {items.length ? (
        items.map((item) => (
          <div key={item.label} className="h-row">
            <span className="h-label">{item.label}</span>
            <div className="h-track">
              <div
                className="h-fill"
                style={{ width: `${Math.max(8, Math.round((item.value / maxValue) * 100))}%` }}
              />
            </div>
            <span className="h-value">{item.value}</span>
          </div>
        ))
      ) : (
        <p className="empty-note">{emptyLabel}</p>
      )}
    </div>
  );
}

function UtilityNav({ activeView, setView = () => {}, copy }) {
  return (
    <div className="micro-nav">
      <button
        type="button"
        className={`micro-button${activeView === "activity" ? " active" : ""}`}
        onClick={() => setView("activity")}
      >
        {copy.utilityNav.activity}
      </button>
      <button
        type="button"
        className={`micro-button${activeView === "leaderboard" ? " active" : ""}`}
        onClick={() => setView("leaderboard")}
      >
        {copy.utilityNav.leaderboard}
      </button>
      <button
        type="button"
        className={`micro-button${activeView === "dashboard" ? " active" : ""}`}
        onClick={() => setView("dashboard")}
      >
        {copy.utilityNav.dashboard}
      </button>
    </div>
  );
}

function loadState() {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }

  const current = parseStorage(STORAGE_KEY);
  if (current) {
    return removeDemoState(current);
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = parseStorage(legacyKey);
    if (legacy) {
      return removeDemoState(legacy);
    }
  }

  return EMPTY_STATE;
}

function parseStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.accounts)) {
      return null;
    }

    return normalizeStoredState(parsed);
  } catch (error) {
    console.warn("Konnte gespeicherte Daten nicht lesen.", error);
    return null;
  }
}

function getStoredSessionAccountId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(SESSION_ACCOUNT_KEY);
  } catch (error) {
    console.warn("Konnte Session-Account nicht lesen.", error);
    return null;
  }
}

function setStoredSessionAccountId(accountId) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (accountId) {
      window.localStorage.setItem(SESSION_ACCOUNT_KEY, accountId);
      return;
    }

    window.localStorage.removeItem(SESSION_ACCOUNT_KEY);
  } catch (error) {
    console.warn("Konnte Session-Account nicht speichern.", error);
  }
}

function getStoredSessionView() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(SESSION_VIEW_KEY);
    if (
      value === "sustainability" ||
      value === "activity" ||
      value === "dashboard" ||
      value === "leaderboard" ||
      value === "chat" ||
      value === "settings" ||
      value === "feedback" ||
      value === "survey"
    ) {
      return value;
    }
  } catch (error) {
    console.warn("Konnte gespeicherte Ansicht nicht lesen.", error);
  }

  return null;
}

function setStoredSessionView(view) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!view) {
      window.localStorage.removeItem(SESSION_VIEW_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_VIEW_KEY, view);
  } catch (error) {
    console.warn("Konnte gespeicherte Ansicht nicht speichern.", error);
  }
}

function buildCatalogItems(approvedActivities = []) {
  const baseItems = Object.entries(SUGGESTIONS).flatMap(([category, items]) =>
    items.map((item) => ({
      key: `${category}:${item.title}`.toLowerCase().trim(),
      title: item.title,
      category,
      defaultPoints: Number(item.points) || 0,
      note: item.note || "",
      isSystem: true,
    })),
  );

  const customItems = approvedActivities.map((item) => ({
    key: `${item.category}:${item.title}`.toLowerCase().trim(),
    title: item.title,
    category: item.category || "custom",
    defaultPoints: Number(item.points) || 0,
    note: item.note || "",
    isSystem: false,
  }));

  const map = new Map();
  for (const item of [...baseItems, ...customItems]) {
    map.set(item.key, item);
  }

  return [...map.values()];
}

function normalizeStoredState(parsed) {
  if (!parsed || !Array.isArray(parsed.accounts)) {
    return EMPTY_STATE;
  }

  return removeDemoState({
    accounts: parsed.accounts.map(normalizeAccount),
    activeAccountId: parsed.activeAccountId || null,
    chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages.map(normalizeChatMessage) : [],
    customProposals: Array.isArray(parsed.customProposals)
      ? parsed.customProposals.map(normalizeProposal)
      : [],
    activityRequests: Array.isArray(parsed.activityRequests)
      ? parsed.activityRequests.map(normalizeActivityRequest)
      : [],
    approvedActivities: Array.isArray(parsed.approvedActivities)
      ? parsed.approvedActivities.map(normalizeApprovedActivity)
      : [],
  });
}

function normalizeAccount(account) {
  const activities = Array.isArray(account.activities)
    ? account.activities.map(normalizeActivity)
    : convertLegacyEntries(account.entries);

  return {
    id: account.id || crypto.randomUUID(),
    backendUserId: account.backendUserId || null,
    name: account.name || "Unbekannt",
    email: account.email || `${(account.name || "user").toLowerCase().replace(/\s+/g, ".")}@local.app`,
    city: account.city || "Unbekannt",
    age: account.age || "18",
    password: account.password || "demo1234",
    createdAt: account.createdAt || new Date().toISOString(),
    activities,
  };
}

function mapUserToAccount(user) {
  return {
    id: user._id,
    backendUserId: user._id,
    name: user.name || "Unbekannt",
    email: user.email || "unknown@local.app",
    city: user.city || "Unbekannt",
    age: user.age || "18",
    password: user.password || "",
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    activities: [],
  };
}

function normalizeActivity(activity) {
  return {
    id: activity.id || crypto.randomUUID(),
    category: activity.category || "custom",
    title: restoreGermanUmlauts(activity.title || "Aktivität"),
    points: Number(activity.points) || 0,
    note: restoreGermanUmlauts(activity.note || ""),
    createdAt: activity.createdAt || new Date().toISOString(),
  };
}

function normalizeChatMessage(message) {
  return {
    id: message.id || crypto.randomUUID(),
    accountId: message.accountId || "system",
    author: message.author || "System",
    message: message.message || "",
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function normalizeProposal(proposal) {
  return {
    id: proposal.id || crypto.randomUUID(),
    createdBy: proposal.createdBy || "unknown",
    createdByName: restoreGermanUmlauts(proposal.createdByName || "Unbekannt"),
    title: restoreGermanUmlauts(proposal.title || "Custom-Aktivität"),
    proposedPoints: Number(proposal.proposedPoints) || 0,
    createdAt: proposal.createdAt || new Date().toISOString(),
    votes: proposal.votes && typeof proposal.votes === "object" ? proposal.votes : {},
  };
}

function normalizeActivityRequest(request) {
  return {
    id: request.id || crypto.randomUUID(),
    category: request.category || "custom",
    title: restoreGermanUmlauts(request.title || "Aktivität"),
    proposedPoints: Number(request.proposedPoints) || 0,
    createdBy: request.createdBy || "unknown",
    createdByName: restoreGermanUmlauts(request.createdByName || "Unbekannt"),
    createdAt: request.createdAt || new Date().toISOString(),
  };
}

function normalizeApprovedActivity(activity) {
  return {
    id: activity.id || crypto.randomUUID(),
    category: activity.category || "custom",
    title: restoreGermanUmlauts(activity.title || "Aktivität"),
    points: Number(activity.points) || 0,
    note: restoreGermanUmlauts(activity.note || ""),
  };
}

function removeDemoState(state) {
  const demoAccountIds = new Set(
    (state.accounts || [])
      .filter((account) => isDemoAccount(account))
      .map((account) => account.id),
  );

  const accounts = (state.accounts || []).filter((account) => !demoAccountIds.has(account.id));
  const activeAccountId = demoAccountIds.has(state.activeAccountId) ? null : state.activeAccountId;

  return {
    ...state,
    accounts,
    activeAccountId,
    chatMessages: (state.chatMessages || []).filter((entry) => !demoAccountIds.has(entry.accountId)),
    customProposals: (state.customProposals || []).filter(
      (proposal) => !demoAccountIds.has(proposal.createdBy),
    ),
    activityRequests: (state.activityRequests || []).filter(
      (request) => !demoAccountIds.has(request.createdBy),
    ),
    approvedActivities: (state.approvedActivities || []).filter(
      (activity) => activity.id !== "demo-approved-1",
    ),
  };
}

function isDemoAccount(account) {
  return account?.id === "demo-power-user" || account?.email === "demo@ecotrack.app";
}

function convertLegacyEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => ({
    id: crypto.randomUUID(),
    category: "custom",
    title: "Vorheriger Nachhaltigkeits-Check-in",
    points: Number(entry.score) || 0,
    note: "Automatisch aus der alten Version übernommen.",
    createdAt: `${entry.date || getTodayKey()}T12:00:00.000Z`,
  }));
}

function restoreGermanUmlauts(value) {
  if (typeof value !== "string" || !value) {
    return value || "";
  }

  return value
    .replace(/Ae/g, "Ä")
    .replace(/Oe/g, "Ö")
    .replace(/Ue/g, "Ü")
    .replace(/ae/g, "ä")
    .replace(/oe/g, "ö")
    .replace(/ue/g, "ü");
}

function getActiveAccount(appState) {
  return appState.accounts.find((account) => account.id === appState.activeAccountId) || null;
}

function createObserverAccount(copy) {
  return {
    id: "observer-view",
    backendUserId: null,
    name: copy.auth.observerLabel,
    email: "",
    city: "",
    age: "",
    password: "",
    createdAt: new Date().toISOString(),
    activities: [],
  };
}

function getLeaderboardData(accounts) {
  const ranked = accounts.map((account) => ({
    account,
    stats: getAccountStats(account),
  }));

  ranked.sort((left, right) => {
    if (right.stats.monthTotal !== left.stats.monthTotal) {
      return right.stats.monthTotal - left.stats.monthTotal;
    }

    if (right.stats.weekTotal !== left.stats.weekTotal) {
      return right.stats.weekTotal - left.stats.weekTotal;
    }

    return left.account.name.localeCompare(right.account.name);
  });

  return ranked.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

function getAccountStats(account, language = "de") {
  const now = new Date();
  const activities = [...account.activities].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const dayTotal = sumActivities(activities.filter((activity) => isWithinDays(activity.createdAt, 1, now)));
  const weekTotal = sumActivities(activities.filter((activity) => isWithinDays(activity.createdAt, 7, now)));
  const monthTotal = sumActivities(activities.filter((activity) => isWithinDays(activity.createdAt, 30, now)));

  return {
    dayTotal,
    weekTotal,
    monthTotal,
    totalPoints: sumActivities(activities),
    dailySeries: buildDailySeries(activities, language),
    weeklySeries: buildWeeklySeries(activities),
    monthlySeries: buildMonthlySeries(activities, language),
    categoryRows: buildCategoryRows(activities, language),
  };
}

function createEmptyStats(language = "de") {
  return {
    dayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    totalPoints: 0,
    dailySeries: buildDailySeries([], language),
    weeklySeries: buildWeeklySeries([]),
    monthlySeries: buildMonthlySeries([], language),
    categoryRows: Object.keys(CATEGORY_LABELS).map((key) => ({ label: getCategoryLabel(key, language), value: 0 })),
  };
}

function buildDailySeries(activities, language = "de") {
  const items = [];
  const locale = language === "en" ? "en-US" : "de-DE";

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = toDayKey(date);

    items.push({
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      value: sumActivities(activities.filter((activity) => toDayKey(new Date(activity.createdAt)) === key)),
    });
  }

  return items;
}

function buildWeeklySeries(activities) {
  const items = [];
  const current = new Date();

  for (let offset = 3; offset >= 0; offset -= 1) {
    const end = new Date(current);
    end.setDate(end.getDate() - offset * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    items.push({
      label: `W${4 - offset}`,
      value: sumActivities(
        activities.filter((activity) => {
          const created = new Date(activity.createdAt).getTime();
          return created >= start.getTime() && created <= end.getTime();
        }),
      ),
    });
  }

  return items;
}

function buildMonthlySeries(activities, language = "de") {
  const items = [];
  const now = new Date();
  const locale = language === "en" ? "en-US" : "de-DE";

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const label = monthDate.toLocaleDateString(locale, { month: "short" });
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    items.push({
      label,
      value: sumActivities(
        activities.filter((activity) => {
          const created = new Date(activity.createdAt);
          return created.getMonth() === month && created.getFullYear() === year;
        }),
      ),
    });
  }

  return items;
}

function buildCategoryRows(activities, language = "de") {
  return Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    label: label[language],
    value: sumActivities(activities.filter((activity) => activity.category === key)),
  }));
}

function sumActivities(activities) {
  return activities.reduce((sum, activity) => sum + (Number(activity.points) || 0), 0);
}

function isWithinDays(dateString, days, now) {
  const created = new Date(dateString).getTime();
  const diff = now.getTime() - created;
  return diff <= days * 24 * 60 * 60 * 1000;
}

function toDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getTodayKey() {
  return toDayKey(new Date());
}

function formatDate(dateString, language = "de") {
  return new Date(dateString).toLocaleDateString(language === "en" ? "en-US" : "de-DE");
}

function formatDateTime(dateString, language = "de") {
  return new Date(dateString).toLocaleString(language === "en" ? "en-US" : "de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterEntriesForExport(entries, range) {
  if (entries === undefined) {
    return undefined;
  }

  const normalizedEntries = Array.isArray(entries) ? entries : [];
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (range.preset === "custom") {
    const start = range.from ? parseDateInput(range.from, false) : null;
    const end = range.to ? parseDateInput(range.to, true) : null;

    if (start && end && start.getTime() > end.getTime()) {
      return null;
    }

    return normalizedEntries.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      if (start && createdAt < start) {
        return false;
      }
      if (end && createdAt > end) {
        return false;
      }
      return true;
    });
  }

  if (range.preset === "all") {
    return normalizedEntries;
  }

  let start = null;
  let end = todayEnd;
  if (range.preset === "today") {
    start = new Date(todayEnd);
    start.setHours(0, 0, 0, 0);
  } else if (range.preset === "7d") {
    start = new Date(todayEnd);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range.preset === "30d") {
    start = new Date(todayEnd);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else if (range.preset === "90d") {
    start = new Date(todayEnd);
    start.setDate(start.getDate() - 89);
    start.setHours(0, 0, 0, 0);
  } else if (range.preset === "thisMonth") {
    start = new Date(todayEnd.getFullYear(), todayEnd.getMonth(), 1, 0, 0, 0, 0);
  } else if (range.preset === "lastMonth") {
    start = new Date(todayEnd.getFullYear(), todayEnd.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(todayEnd.getFullYear(), todayEnd.getMonth(), 0, 23, 59, 59, 999);
  } else if (range.preset === "year") {
    start = new Date(todayEnd.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  if (!start) {
    return normalizedEntries;
  }

  return normalizedEntries.filter((entry) => {
    const createdAt = new Date(entry.createdAt);
    return createdAt >= start && createdAt <= end;
  });
}

function parseDateInput(value, endOfDay = false) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPresetDateRange(preset) {
  const today = new Date();
  const format = (value) => toDayKey(value);

  if (preset === "all") {
    return { from: "", to: "" };
  }

  if (preset === "today") {
    const day = format(today);
    return { from: day, to: day };
  }

  if (preset === "7d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: format(from), to: format(today) };
  }

  if (preset === "30d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: format(from), to: format(today) };
  }

  if (preset === "90d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 89);
    return { from: format(from), to: format(today) };
  }

  if (preset === "thisMonth") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: format(from), to: format(today) };
  }

  if (preset === "lastMonth") {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: format(from), to: format(to) };
  }

  if (preset === "year") {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: format(from), to: format(today) };
  }

  return { from: "", to: "" };
}

function getExportRangeLabel(preset, copy) {
  const labels = {
    all: copy.dashboard.exportFilterAll,
    today: copy.dashboard.exportFilterToday,
    "7d": copy.dashboard.exportFilter7Days,
    "30d": copy.dashboard.exportFilter30Days,
    "90d": copy.dashboard.exportFilter90Days,
    thisMonth: copy.dashboard.exportFilterThisMonth,
    lastMonth: copy.dashboard.exportFilterLastMonth,
    year: copy.dashboard.exportFilterYear,
    custom: copy.dashboard.exportFilterCustom,
  };

  return labels[preset] || copy.dashboard.exportFilter30Days;
}

function buildActivityExportWorkbook({ entries, account, language = "de" }) {
  const labels = getExcelLabels(language);
  const now = new Date();
  const normalizedEntries = [...entries]
    .map((entry) => ({
      ...entry,
      createdAtIso: new Date(entry.createdAt).toISOString(),
    }))
    .sort((left, right) => right.createdAt - left.createdAt);

  const totalPoints = normalizedEntries.reduce((sum, entry) => sum + (entry.points || 0), 0);
  const todayPoints = normalizedEntries
    .filter((entry) => isWithinDays(entry.createdAtIso, 1, now))
    .reduce((sum, entry) => sum + entry.points, 0);
  const weekPoints = normalizedEntries
    .filter((entry) => isWithinDays(entry.createdAtIso, 7, now))
    .reduce((sum, entry) => sum + entry.points, 0);
  const monthPoints = normalizedEntries
    .filter((entry) => isWithinDays(entry.createdAtIso, 30, now))
    .reduce((sum, entry) => sum + entry.points, 0);

  const categoryMap = new Map();
  const monthMap = new Map();

  normalizedEntries.forEach((entry) => {
    const categoryLabel = getCategoryLabel(entry.category, language);
    const monthKey = entry.dateKey.slice(0, 7);
    const currentCategory = categoryMap.get(categoryLabel) || { points: 0, activities: 0 };
    const currentMonth = monthMap.get(monthKey) || { points: 0, activities: 0 };

    currentCategory.points += entry.points;
    currentCategory.activities += 1;
    categoryMap.set(categoryLabel, currentCategory);

    currentMonth.points += entry.points;
    currentMonth.activities += 1;
    monthMap.set(monthKey, currentMonth);
  });

  const firstEntry = normalizedEntries[normalizedEntries.length - 1];
  const lastEntry = normalizedEntries[0];

  return {
    sheetNames: labels.sheetNames,
    summaryRows: [
      { [labels.summary.metric]: labels.summary.user, [labels.summary.value]: account.name },
      { [labels.summary.metric]: labels.summary.email, [labels.summary.value]: account.email },
      { [labels.summary.metric]: labels.summary.exportedAt, [labels.summary.value]: formatDateTime(now.toISOString(), language) },
      { [labels.summary.metric]: labels.summary.activities, [labels.summary.value]: normalizedEntries.length },
      { [labels.summary.metric]: labels.summary.totalPoints, [labels.summary.value]: totalPoints },
      { [labels.summary.metric]: labels.summary.todayPoints, [labels.summary.value]: todayPoints },
      { [labels.summary.metric]: labels.summary.weekPoints, [labels.summary.value]: weekPoints },
      { [labels.summary.metric]: labels.summary.monthPoints, [labels.summary.value]: monthPoints },
      {
        [labels.summary.metric]: labels.summary.firstEntry,
        [labels.summary.value]: firstEntry ? formatDateTime(firstEntry.createdAtIso, language) : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.lastEntry,
        [labels.summary.value]: lastEntry ? formatDateTime(lastEntry.createdAtIso, language) : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.firstActivityTitle,
        [labels.summary.value]: firstEntry ? firstEntry.title : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.lastActivityTitle,
        [labels.summary.value]: lastEntry ? lastEntry.title : labels.empty,
      },
    ],
    categoryRows: Array.from(categoryMap.entries())
      .map(([category, values]) => ({
        [labels.categories.category]: category,
        [labels.categories.activities]: values.activities,
        [labels.categories.points]: values.points,
      }))
      .sort((left, right) => right[labels.categories.points] - left[labels.categories.points]),
    monthRows: Array.from(monthMap.entries())
      .map(([month, values]) => ({
        [labels.months.month]: month,
        [labels.months.activities]: values.activities,
        [labels.months.points]: values.points,
      }))
      .sort((left, right) => right[labels.months.month].localeCompare(left[labels.months.month])),
    entryRows: normalizedEntries.map((entry) => ({
      [labels.entries.user]: account.name,
      [labels.entries.email]: account.email,
      [labels.entries.date]: formatDate(entry.createdAtIso, language),
      [labels.entries.time]: formatDateTime(entry.createdAtIso, language),
      [labels.entries.timestamp]: entry.createdAtIso,
      [labels.entries.category]: getCategoryLabel(entry.category, language),
      [labels.entries.activity]: entry.title,
      [labels.entries.points]: entry.points,
      [labels.entries.note]: entry.note || "",
      [labels.entries.dateKey]: entry.dateKey,
    })),
  };
}

function buildCommunityExportWorkbook({ users, entries, language = "de" }) {
  const labels = getCommunityExcelLabels(language);
  const now = new Date();
  const userLookup = new Map(
    users.map((user) => [
      user._id,
      {
        id: user._id,
        name: user.name || labels.unknownUser,
        email: user.email || "",
        city: user.city || "",
        age: user.age || "",
        createdAt: user.createdAt || null,
      },
    ]),
  );

  const normalizedEntries = [...entries]
    .map((entry) => ({
      ...entry,
      createdAtIso: new Date(entry.createdAt).toISOString(),
      user: userLookup.get(entry.userId) || {
        id: entry.userId,
        name: labels.unknownUser,
        email: "",
        city: "",
        age: "",
        createdAt: null,
      },
    }))
    .sort((left, right) => right.createdAt - left.createdAt);

  const userStats = new Map(
    users.map((user) => [
      user._id,
      { activities: 0, points: 0, lastActivityAt: null },
    ]),
  );
  const categoryStats = new Map();
  const monthStats = new Map();

  normalizedEntries.forEach((entry) => {
    const stats = userStats.get(entry.userId) || { activities: 0, points: 0, lastActivityAt: null };
    stats.activities += 1;
    stats.points += entry.points;
    stats.lastActivityAt = !stats.lastActivityAt || entry.createdAt > stats.lastActivityAt
      ? entry.createdAt
      : stats.lastActivityAt;
    userStats.set(entry.userId, stats);

    const categoryLabel = getCategoryLabel(entry.category, language);
    const currentCategory = categoryStats.get(categoryLabel) || { activities: 0, points: 0 };
    currentCategory.activities += 1;
    currentCategory.points += entry.points;
    categoryStats.set(categoryLabel, currentCategory);

    const monthKey = entry.dateKey.slice(0, 7);
    const currentMonth = monthStats.get(monthKey) || { activities: 0, points: 0 };
    currentMonth.activities += 1;
    currentMonth.points += entry.points;
    monthStats.set(monthKey, currentMonth);
  });

  const firstEntry = normalizedEntries[normalizedEntries.length - 1];
  const lastEntry = normalizedEntries[0];

  return {
    sheetNames: labels.sheetNames,
    summaryRows: [
      { [labels.summary.metric]: labels.summary.exportedAt, [labels.summary.value]: formatDateTime(now.toISOString(), language) },
      { [labels.summary.metric]: labels.summary.users, [labels.summary.value]: users.length },
      { [labels.summary.metric]: labels.summary.activities, [labels.summary.value]: normalizedEntries.length },
      {
        [labels.summary.metric]: labels.summary.totalPoints,
        [labels.summary.value]: normalizedEntries.reduce((sum, entry) => sum + entry.points, 0),
      },
      {
        [labels.summary.metric]: labels.summary.firstEntry,
        [labels.summary.value]: firstEntry ? formatDateTime(firstEntry.createdAtIso, language) : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.lastEntry,
        [labels.summary.value]: lastEntry ? formatDateTime(lastEntry.createdAtIso, language) : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.firstActivityTitle,
        [labels.summary.value]: firstEntry ? `${firstEntry.user.name}: ${firstEntry.title}` : labels.empty,
      },
      {
        [labels.summary.metric]: labels.summary.lastActivityTitle,
        [labels.summary.value]: lastEntry ? `${lastEntry.user.name}: ${lastEntry.title}` : labels.empty,
      },
    ],
    userRows: users
      .map((user) => {
        const stats = userStats.get(user._id) || { activities: 0, points: 0, lastActivityAt: null };
        return {
          [labels.users.name]: user.name || labels.unknownUser,
          [labels.users.email]: user.email || "",
          [labels.users.city]: user.city || "",
          [labels.users.age]: user.age || "",
          [labels.users.registeredAt]: user.createdAt
            ? formatDateTime(new Date(user.createdAt).toISOString(), language)
            : labels.empty,
          [labels.users.activities]: stats.activities,
          [labels.users.points]: stats.points,
          [labels.users.lastActivity]: stats.lastActivityAt
            ? formatDateTime(new Date(stats.lastActivityAt).toISOString(), language)
            : labels.empty,
        };
      })
      .sort((left, right) => right[labels.users.points] - left[labels.users.points]),
    categoryRows: Array.from(categoryStats.entries())
      .map(([category, values]) => ({
        [labels.categories.category]: category,
        [labels.categories.activities]: values.activities,
        [labels.categories.points]: values.points,
      }))
      .sort((left, right) => right[labels.categories.points] - left[labels.categories.points]),
    monthRows: Array.from(monthStats.entries())
      .map(([month, values]) => ({
        [labels.months.month]: month,
        [labels.months.activities]: values.activities,
        [labels.months.points]: values.points,
      }))
      .sort((left, right) => right[labels.months.month].localeCompare(left[labels.months.month])),
    entryRows: normalizedEntries.map((entry) => ({
      [labels.entries.userId]: entry.user.id,
      [labels.entries.user]: entry.user.name,
      [labels.entries.email]: entry.user.email,
      [labels.entries.date]: formatDate(entry.createdAtIso, language),
      [labels.entries.time]: formatDateTime(entry.createdAtIso, language),
      [labels.entries.timestamp]: entry.createdAtIso,
      [labels.entries.category]: getCategoryLabel(entry.category, language),
      [labels.entries.activity]: entry.title,
      [labels.entries.points]: entry.points,
      [labels.entries.note]: entry.note || "",
      [labels.entries.dateKey]: entry.dateKey,
    })),
  };
}

function getExcelLabels(language = "de") {
  if (language === "en") {
    return {
      empty: "No data",
      sheetNames: {
        summary: "Summary",
        categories: "Categories",
        months: "Months",
        entries: "Activities",
      },
      summary: {
        metric: "Metric",
        value: "Value",
        user: "User",
        email: "Email",
        exportedAt: "Exported at",
        activities: "Activities",
        totalPoints: "Total points",
        todayPoints: "Points today",
        weekPoints: "Points last 7 days",
        monthPoints: "Points last 30 days",
        firstEntry: "First activity",
        lastEntry: "Latest activity",
        firstActivityTitle: "First activity title",
        lastActivityTitle: "Latest activity title",
      },
      categories: {
        category: "Category",
        activities: "Activities",
        points: "Points",
      },
      months: {
        month: "Month",
        activities: "Activities",
        points: "Points",
      },
      entries: {
        user: "User",
        email: "Email",
        date: "Date",
        time: "Date and time",
        timestamp: "ISO timestamp",
        category: "Category",
        activity: "Activity",
        points: "Points",
        note: "Note",
        dateKey: "Date key",
      },
    };
  }

  return {
    empty: "Keine Daten",
    sheetNames: {
      summary: "Zusammenfassung",
      categories: "Kategorien",
      months: "Monate",
      entries: "Aktivitäten",
    },
    summary: {
      metric: "Kennzahl",
      value: "Wert",
      user: "Nutzer",
      email: "E-Mail",
      exportedAt: "Exportiert am",
      activities: "Aktivitäten",
      totalPoints: "Punkte gesamt",
      todayPoints: "Punkte heute",
      weekPoints: "Punkte letzte 7 Tage",
      monthPoints: "Punkte letzte 30 Tage",
      firstEntry: "Erste Aktivität",
      lastEntry: "Neueste Aktivität",
      firstActivityTitle: "Titel der ersten Aktivität",
      lastActivityTitle: "Titel der neuesten Aktivität",
    },
    categories: {
      category: "Kategorie",
      activities: "Aktivitäten",
      points: "Punkte",
    },
    months: {
      month: "Monat",
      activities: "Aktivitäten",
      points: "Punkte",
    },
    entries: {
      user: "Nutzer",
      email: "E-Mail",
      date: "Datum",
      time: "Datum und Uhrzeit",
      timestamp: "ISO-Zeitstempel",
      category: "Kategorie",
      activity: "Aktivität",
      points: "Punkte",
      note: "Notiz",
      dateKey: "Datumsschlüssel",
    },
  };
}

function getCommunityExcelLabels(language = "de") {
  if (language === "en") {
    return {
      empty: "No data",
      unknownUser: "Unknown user",
      sheetNames: {
        summary: "Summary",
        users: "Users",
        categories: "Categories",
        months: "Months",
        entries: "Activities",
      },
      summary: {
        metric: "Metric",
        value: "Value",
        exportedAt: "Exported at",
        users: "Users",
        activities: "Activities",
        totalPoints: "Total points",
        firstEntry: "First activity",
        lastEntry: "Latest activity",
        firstActivityTitle: "First activity title",
        lastActivityTitle: "Latest activity title",
      },
      users: {
        name: "Name",
        email: "Email",
        city: "City",
        age: "Age",
        registeredAt: "Registered at",
        activities: "Activities",
        points: "Points",
        lastActivity: "Latest activity",
      },
      categories: {
        category: "Category",
        activities: "Activities",
        points: "Points",
      },
      months: {
        month: "Month",
        activities: "Activities",
        points: "Points",
      },
      entries: {
        userId: "User ID",
        user: "User",
        email: "Email",
        date: "Date",
        time: "Date and time",
        timestamp: "ISO timestamp",
        category: "Category",
        activity: "Activity",
        points: "Points",
        note: "Note",
        dateKey: "Date key",
      },
    };
  }

  return {
    empty: "Keine Daten",
    unknownUser: "Unbekannter Nutzer",
    sheetNames: {
      summary: "Zusammenfassung",
      users: "Nutzer",
      categories: "Kategorien",
      months: "Monate",
      entries: "Aktivitäten",
    },
    summary: {
      metric: "Kennzahl",
      value: "Wert",
      exportedAt: "Exportiert am",
      users: "Nutzer",
      activities: "Aktivitäten",
      totalPoints: "Punkte gesamt",
      firstEntry: "Erste Aktivität",
      lastEntry: "Neueste Aktivität",
      firstActivityTitle: "Titel der ersten Aktivität",
      lastActivityTitle: "Titel der neuesten Aktivität",
    },
    users: {
      name: "Name",
      email: "E-Mail",
      city: "Stadt",
      age: "Alter",
      registeredAt: "Registriert am",
      activities: "Aktivitäten",
      points: "Punkte",
      lastActivity: "Neueste Aktivität",
    },
    categories: {
      category: "Kategorie",
      activities: "Aktivitäten",
      points: "Punkte",
    },
    months: {
      month: "Monat",
      activities: "Aktivitäten",
      points: "Punkte",
    },
    entries: {
      userId: "Nutzer-ID",
      user: "Nutzer",
      email: "E-Mail",
      date: "Datum",
      time: "Datum und Uhrzeit",
      timestamp: "ISO-Zeitstempel",
      category: "Kategorie",
      activity: "Aktivität",
      points: "Punkte",
      note: "Notiz",
      dateKey: "Datumsschlüssel",
    },
  };
}

function buildExcelFilename(name) {
  const slug = String(name || "ecotrack")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ecotrack";
  const stamp = new Date().toISOString().slice(0, 10);
  return `ecotrack-export-${slug}-${stamp}.xlsx`;
}

function buildCommunityExcelFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `ecotrack-admin-export-${stamp}.xlsx`;
}

function getProposalAverage(proposal) {
  const values = Object.values(proposal.votes || {}).map((value) => Number(value)).filter(Boolean);
  if (!values.length) {
    return proposal.proposedPoints;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getLevelStats(totalPoints) {
  const normalizedTotalPoints = Math.max(0, Math.floor(parsePointValue(totalPoints)));
  const pointsPerLevel = 100;
  const level = Math.floor(normalizedTotalPoints / pointsPerLevel) + 1;
  const nextThreshold = level * pointsPerLevel;
  const progressInLevel = normalizedTotalPoints % pointsPerLevel;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((progressInLevel / pointsPerLevel) * 100)),
  );

  return {
    level,
    nextThreshold,
    progressPercent,
    pointsToNext: nextThreshold - normalizedTotalPoints,
    currentLabel: getLevelName(level),
    nextLabel: getLevelName(level + 1),
  };
}

function parsePointValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const raw = value.trim();
  if (!raw) {
    return 0;
  }

  const cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned) {
    return 0;
  }

  let normalized = cleaned;

  if (normalized.includes(".") && normalized.includes(",")) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  } else if (/^\d{1,3}(,\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/,/g, "");
  } else {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLevelName(level) {
  return `Level ${Math.max(1, Math.floor(level))}`;
}

function getCategoryLabel(category, language = "de") {
  return CATEGORY_LABELS[category]?.[language] || CATEGORY_LABELS.custom[language];
}

function localizeActivityForLanguage(item, language = "de") {
  if (language !== "en") {
    return item;
  }

  const translation = ACTIVITY_EN_OVERRIDES[item.category]?.[item.title];
  if (!translation) {
    return item;
  }

  return {
    ...item,
    title: translation.title,
    note: translation.note || item.note,
  };
}

function getFeedbackCategoryLabel(category, language = "de", copy = COPY[language]) {
  if (category === "general") {
    return copy.feedback.generalArea;
  }

  return FEEDBACK_CATEGORY_LABELS[category]?.[language] || FEEDBACK_CATEGORY_LABELS.general[language];
}

function getTreeGrowth(levelStats, copy) {
  const level = levelStats.level;
  const progress = levelStats.progressPercent;
  const levelProgress = Math.max(0, level - 1 + progress / 100);
  const maturity = Math.max(0, Math.min(1, levelProgress / 20));
  const rootProgress = 0.28 + maturity * 0.72;
  const trunkHeight = Math.min(150, 40 + levelProgress * 4.2);
  const branchVisible = Math.max(0.2, Math.min(1, 0.15 + maturity * 0.95));
  const canopyScale = 0.62 + maturity * 0.78;
  const canopyFront = Math.max(0.2, Math.min(1, 0.2 + maturity * 0.8));
  const canopyMid = Math.max(0.12, Math.min(1, 0.12 + maturity * 0.88));
  const canopyBack = Math.max(0.08, Math.min(1, 0.08 + maturity * 0.92));
  const leafCount = Math.min(14, 3 + Math.floor(levelProgress / 1.8));
  const fruitCount = Math.min(7, Math.max(0, Math.floor((levelProgress - 5) / 3)));

  let stageLabel = "";
  if (levelProgress < 1.5) {
    stageLabel = copy.activity.treeStageRoots(progress);
  } else if (levelProgress < 3.5) {
    stageLabel = copy.activity.treeStageTrunk(progress);
  } else {
    stageLabel = copy.activity.treeStageCrown(level);
  }

  const leafClusters = [];

  const fruits = Array.from({ length: fruitCount }, (_, index) => {
    const ratio = fruitCount > 1 ? index / (fruitCount - 1) : 0.5;
    const x = -40 + ratio * 80;
    const y = 146 + ((index + level) % 3) * 10;
    const size = 7 + ((index + level) % 2);

    return {
      id: `fruit-${index}`,
      style: {
        left: `calc(50% + ${x}px)`,
        bottom: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.55 + maturity * 0.45,
      },
    };
  });

  return {
    rootStyle: {
      opacity: rootProgress,
      transform: `scaleX(${0.55 + rootProgress * 0.45})`,
    },
    trunkStyle: {
      height: `${trunkHeight}px`,
    },
    branchStyle: {
      opacity: branchVisible,
      transform: `scale(${0.7 + branchVisible * 0.3})`,
    },
    canopyFrontStyle: {
      opacity: canopyFront,
      transform: `translateX(-50%) scale(${canopyScale})`,
    },
    canopyMidStyle: {
      opacity: canopyMid,
      transform: `translateX(-50%) scale(${canopyScale * 1.08})`,
    },
    canopyBackStyle: {
      opacity: canopyBack,
      transform: `translateX(-50%) scale(${canopyScale * 1.16})`,
    },
    leafClusters,
    fruits,
    stageLabel,
  };
}
