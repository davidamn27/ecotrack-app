"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const STORAGE_KEY = "ecoboard-data-v7";
const LANGUAGE_KEY = "ecoboard-language-v1";
const DEVELOPER_EMAIL = "davidammann@web.de";
const SURVEY_URL = "https://forms.cloud.microsoft/r/rn9GGZV6Na";
const LEGACY_STORAGE_KEYS = [];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const IS_DEV_BUILD = process.env.NODE_ENV !== "production";
const TEST_USER_ID = "demo-power-user";

const LEVEL_NAMES = [
  "Starter",
  "Scout",
  "Mover",
  "Impact",
  "Leader",
  "Visionary",
  "Trailblazer",
  "Guardian",
  "Pioneer",
  "Catalyst",
  "Explorer",
  "Mentor",
  "Architect",
  "Steward",
  "Champion",
  "Shaper",
  "Navigator",
  "Innovator",
  "Beacon",
  "Summit",
  "Legacy",
  "Momentum",
  "Horizon",
  "Evergreen",
  "Earthkeeper",
];

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
      body: "Bitte Impressumstext hier ergänzen.",
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
        `Mail-Entwurf fuer "${title}" an ${DEVELOPER_EMAIL} wurde geoeffnet.`,
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
      body: "Please add the legal notice text here.",
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
      genericError: "Technical error. Please try again.",
    },
  },
};

const SUGGESTIONS = {
  mobility: [
    { title: "Mit dem Fahrrad zur Arbeit", points: 2, note: "Bike to Work." },
    { title: "Zu Fuß zur Arbeit", points: 3, note: "Walk to Work." },
    { title: "Öffentliche Verkehrsmittel genutzt", points: 3, note: "Use Public Transport." },
    { title: "Fahrgemeinschaft organisiert", points: 2, note: "Carpooling." },
    { title: "Home Office statt Pendeln", points: 5, note: "Spart den kompletten Arbeitsweg." },
    { title: "Kurze Strecke ohne Auto", points: 3, note: "Short Trip Without Car unter 5 km." },
    { title: "E-Bike statt Auto genutzt", points: 3, note: "Use E-Bike Instead of Car." },
  ],
  nutrition: [
    { title: "Vegetarisch gegessen", points: 3, note: "Eat Vegetarian Meal." },
    { title: "Vegan gegessen", points: 4, note: "Eat Vegan Meal." },
    { title: "Selbst gekocht", points: 2, note: "Cook at Home." },
    { title: "Reste verwertet", points: 3, note: "Use Leftovers." },
    { title: "Leitungswasser statt Flaschenwasser", points: 2, note: "Drink Tap Water Instead of Bottled." },
    { title: "Regionale Produkte gekauft", points: 2, note: "Buy Regional Products." },
    { title: "Lebensmittel vor Verschwendung gerettet", points: 5, note: "Save Food from Waste." },
  ],
  household: [
    { title: "Duschzeit reduziert", points: 3, note: "Reduce Shower Time." },
    { title: "Waschmaschine voll beladen genutzt", points: 2, note: "Use Washing Machine Fully Loaded." },
    { title: "Wäsche luftgetrocknet", points: 3, note: "Air Dry Laundry statt Trockner." },
    { title: "Geschirrspüler im Eco-Modus", points: 2, note: "Use Dishwasher Eco Mode." },
    { title: "Standby-Geräte ausgeschaltet", points: 2, note: "Turn Off Standby Devices." },
    { title: "Heizung gesenkt", points: 4, note: "Lower Heating Temperature." },
    { title: "Licht ausgeschaltet, wenn nicht nötig", points: 1, note: "Switch Off Lights When Not Needed." },
  ],
  custom: [
    { title: "Second-Hand-Produkt gekauft", points: 3, note: "Buy Second Hand Product." },
    { title: "Kleidung repariert", points: 4, note: "Repair Clothing." },
    { title: "Elektronisches Gerät repariert", points: 5, note: "Repair Electronic Device." },
    { title: "Wiederverwendbare Produkte genutzt", points: 2, note: "Use Reusable Products." },
    { title: "Baum oder Pflanze gesetzt", points: 5, note: "Plant a Tree or Plant." },
    { title: "An Nachhaltigkeits-Event teilgenommen", points: 4, note: "Participate in Sustainability Event." },
  ],
};

const ACTIVITY_EN_OVERRIDES = {
  mobility: {
    "Mit dem Fahrrad zur Arbeit": "Bike to work",
    "Zu Fuß zur Arbeit": "Walk to work",
    "Öffentliche Verkehrsmittel genutzt": "Used public transport",
    "Fahrgemeinschaft organisiert": "Organized carpooling",
    "Home Office statt Pendeln": "Worked from home instead of commuting",
    "Kurze Strecke ohne Auto": "Short trip without car",
    "E-Bike statt Auto genutzt": "Used e-bike instead of car",
  },
  nutrition: {
    "Vegetarisch gegessen": "Ate vegetarian",
    "Vegan gegessen": "Ate vegan",
    "Selbst gekocht": "Cooked at home",
    "Reste verwertet": "Used leftovers",
    "Leitungswasser statt Flaschenwasser": "Drank tap water instead of bottled water",
    "Regionale Produkte gekauft": "Bought regional products",
    "Lebensmittel vor Verschwendung gerettet": "Saved food from waste",
  },
  household: {
    "Duschzeit reduziert": "Reduced shower time",
    "Waschmaschine voll beladen genutzt": "Used fully loaded washing machine",
    "Wäsche luftgetrocknet": "Air-dried laundry",
    "Geschirrspüler im Eco-Modus": "Used dishwasher eco mode",
    "Standby-Geräte ausgeschaltet": "Switched off standby devices",
    "Heizung gesenkt": "Lowered heating",
    "Licht ausgeschaltet, wenn nicht nötig": "Switched off lights when not needed",
  },
  custom: {
    "Second-Hand-Produkt gekauft": "Bought second-hand product",
    "Kleidung repariert": "Repaired clothing",
    "Elektronisches Gerät repariert": "Repaired electronic device",
    "Wiederverwendbare Produkte genutzt": "Used reusable products",
    "Baum oder Pflanze gesetzt": "Planted a tree or plant",
    "An Nachhaltigkeits-Event teilgenommen": "Joined a sustainability event",
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

function createDemoTimestamp(daysAgo = 0, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function createSeedState() {
  const demoActivities = [
    { id: "demo-act-1", category: "mobility", title: "Mit dem Fahrrad zur Uni", points: 84, note: "Testeintrag", createdAt: createDemoTimestamp(0, 8) },
    { id: "demo-act-2", category: "nutrition", title: "Vegane Woche durchgezogen", points: 96, note: "Testeintrag", createdAt: createDemoTimestamp(1, 12) },
    { id: "demo-act-3", category: "household", title: "Energieverbrauch bewusst gesenkt", points: 112, note: "Testeintrag", createdAt: createDemoTimestamp(2, 19) },
    { id: "demo-act-4", category: "custom", title: "Repair-Cafe organisiert", points: 103, note: "Testeintrag", createdAt: createDemoTimestamp(3, 14) },
    { id: "demo-act-5", category: "mobility", title: "Komplette Woche ohne Auto", points: 127, note: "Testeintrag", createdAt: createDemoTimestamp(4, 9) },
    { id: "demo-act-6", category: "nutrition", title: "Foodsharing-Aktion umgesetzt", points: 118, note: "Testeintrag", createdAt: createDemoTimestamp(5, 18) },
    { id: "demo-act-7", category: "household", title: "Wasserspar-Challenge", points: 92, note: "Testeintrag", createdAt: createDemoTimestamp(6, 7) },
    { id: "demo-act-8", category: "custom", title: "Nachhaltigkeits-Workshop gegeben", points: 136, note: "Testeintrag", createdAt: createDemoTimestamp(8, 16) },
    { id: "demo-act-9", category: "mobility", title: "Fahrradpendeln im ganzen Monat", points: 158, note: "Testeintrag", createdAt: createDemoTimestamp(10, 8) },
    { id: "demo-act-10", category: "nutrition", title: "Regionale Einkaufschallenge", points: 149, note: "Testeintrag", createdAt: createDemoTimestamp(12, 11) },
    { id: "demo-act-11", category: "household", title: "Heizkosten optimiert", points: 164, note: "Testeintrag", createdAt: createDemoTimestamp(15, 20) },
    { id: "demo-act-12", category: "custom", title: "Campus-Tauschbörse gestartet", points: 177, note: "Testeintrag", createdAt: createDemoTimestamp(18, 13) },
    { id: "demo-act-13", category: "mobility", title: "Mitfahrnetzwerk aufgebaut", points: 201, note: "Testeintrag", createdAt: createDemoTimestamp(22, 9) },
    { id: "demo-act-14", category: "nutrition", title: "Kochabend mit geretteten Lebensmitteln", points: 173, note: "Testeintrag", createdAt: createDemoTimestamp(25, 18) },
    { id: "demo-act-15", category: "household", title: "DIY-Upcycling-Projekt umgesetzt", points: 97, note: "Testeintrag", createdAt: createDemoTimestamp(28, 15) },
  ];

  return {
    accounts: [
      {
        id: TEST_USER_ID,
        name: "Eco Demo",
        email: "demo@ecotrack.app",
        city: "Berlin",
        age: "24",
        password: "demo1234",
        createdAt: createDemoTimestamp(40, 10),
        activities: demoActivities,
      },
    ],
    activeAccountId: TEST_USER_ID,
    chatMessages: [
      {
        id: "demo-chat-1",
        accountId: TEST_USER_ID,
        author: "Eco Demo",
        message: "Ich teste gerade Chat, Level-System und Sammelliste. Alles laeuft bis hierhin sauber.",
        createdAt: createDemoTimestamp(0, 13),
      },
    ],
    customProposals: [
      {
        id: "demo-proposal-1",
        createdBy: TEST_USER_ID,
        createdByName: "Eco Demo",
        title: "Regenwasser fuer Pflanzen genutzt",
        proposedPoints: 7,
        createdAt: createDemoTimestamp(1, 17),
        votes: {},
      },
    ],
    activityRequests: [
      {
        id: "demo-request-1",
        category: "custom",
        title: "Solarladegeraet im Alltag genutzt",
        proposedPoints: 8,
        createdBy: TEST_USER_ID,
        createdByName: "Eco Demo",
        createdAt: createDemoTimestamp(0, 14),
      },
    ],
    approvedActivities: [
      {
        id: "demo-approved-1",
        category: "custom",
        title: "Mehrwegbecher im Alltag genutzt",
        points: 3,
        note: "Vom Entwickler freigegeben.",
      },
    ],
  };
}

function ensureSeedData(state) {
  const seed = createSeedState();
  const hasTestUser = state.accounts.some((account) => account.id === TEST_USER_ID);

  if (hasTestUser) {
    return state;
  }

  return {
    ...state,
    accounts: [...state.accounts, ...seed.accounts],
    activeAccountId: state.activeAccountId || (state.accounts.length ? state.activeAccountId : seed.activeAccountId),
    chatMessages: [...seed.chatMessages, ...(state.chatMessages || [])],
    customProposals: [...seed.customProposals, ...(state.customProposals || [])],
    activityRequests: [...seed.activityRequests, ...(state.activityRequests || [])],
    approvedActivities: [...seed.approvedActivities, ...(state.approvedActivities || [])],
  };
}

export default function Page() {
  const [appState, setAppState] = useState(EMPTY_STATE);
  const [hasHydratedState, setHasHydratedState] = useState(false);
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
  const remoteAppState = useQuery(api.appState.get, { name: "main" });
  const saveRemoteAppState = useMutation(api.appState.save);
  const registerUser = useMutation(api.users.register);
  const loginUser = useMutation(api.users.login);
  const updateUserProfile = useMutation(api.users.updateProfile);
  const changeUserPassword = useMutation(api.users.changePassword);
  const deleteUser = useMutation(api.users.deleteUser);
  const upsertActivityCatalog = useMutation(api.activityTracking.upsertCatalog);
  const addActivityEntries = useMutation(api.activityTracking.addEntries);
  const copy = COPY[language];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage === "de" || storedLanguage === "en") {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (hasHydratedState || remoteAppState === undefined) {
      return;
    }

    const loaded = remoteAppState?.state
      ? normalizeStoredState(remoteAppState.state)
      : loadState();
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

    saveRemoteAppState({ name: "main", state: appState }).catch((error) => {
      console.error("Konnte App-Status nicht in Convex speichern.", error);
    });
  }, [appState, hasHydratedState, saveRemoteAppState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const activeAccount = getActiveAccount(appState);
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
    ...SUGGESTIONS[selectedCategory],
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
      author: activeAccount?.name || "System",
      message,
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
      title: activity.title,
      points: activity.points,
      note: activity.note || "",
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
      title: activity.title,
      points: activity.points,
      note: activity.note || "",
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
      title: item.title,
      points: item.points,
      note: item.note,
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
    updateAppState((current) => ({
      ...current,
      activityRequests: [
        {
          id: crypto.randomUUID(),
          category,
          title,
          proposedPoints: points,
          createdBy: current.activeAccountId,
          createdByName: activeAccount.name,
          createdAt: new Date().toISOString(),
        },
        ...(current.activityRequests || []),
      ].slice(0, 40),
    }));

    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(`EcoTrack Vorschlag: ${title}`);
      const body = encodeURIComponent(
        `Neuer Aktivitaetsvorschlag fuer EcoTrack\n\nKategorie: ${getCategoryLabel(category, "de")}\nAktivitaet: ${title}\nVorgeschlagene Punkte: ${points}\nEingereicht von: ${activeAccount.name} (${activeAccount.email})`,
      );
      window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
    }

    setStatus(`${copy.status.requestSubmitted(title)} ${copy.status.developerMailOpened(title)}`);
  }

  function handleSubmitActivityRequest(event) {
    event.preventDefault();

    const title = requestTitle.trim();
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
    const suggestion = String(formData.get("suggestion") || "").trim();
    const category = String(formData.get("category") || "").trim() || "mobility";

    if (!suggestion) {
      setStatus(copy.status.fillAll);
      return;
    }

    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(`EcoTrack Verbesserungsvorschlag von ${activeAccount.name}`);
      const body = encodeURIComponent(
        `Verbesserungsvorschlag fuer EcoTrack\n\nUser-Name: ${activeAccount.name}\nE-Mail: ${activeAccount.email}\nBereich: ${getFeedbackCategoryLabel(category, "de", COPY.de)}\n\nVorschlag:\n${suggestion}`,
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

    const title = proposalTitle.trim();
    const points = Number(proposalPoints);

    if (!title || Number.isNaN(points) || points < 1) {
      setStatus(copy.status.customInvalid);
      return;
    }

    updateAppState((current) => {
      const proposal = {
        id: crypto.randomUUID(),
        createdBy: current.activeAccountId,
        createdByName: activeAccount.name,
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
                  {activeAccount.name}: {copy.activity.level} {levelStats.level}
                </h3>
              </div>
              <p className="level-points">{stats.totalPoints} {copy.dashboard.points}</p>
            </div>
            <p className="level-copy">
              {copy.activity.levelProgress(levelStats.pointsToNext, levelStats.nextLabel, levelStats.nextThreshold)}
            </p>
            <div className="level-track" aria-label="Fortschritt zum nächsten Level">
              <div className="level-fill" style={{ width: `${levelStats.progressPercent}%` }} />
            </div>
            <div className="level-meta">
              <p>{levelStats.progressPercent}% {copy.activity.progress}</p>
              <p>{copy.activity.today}: {stats.dayTotal}</p>
              <p>{copy.activity.week}: {stats.weekTotal}</p>
            </div>
          </div>
          <LevelTree levelStats={levelStats} copy={copy} />
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
          <div className="summary-chip">{copy.dashboard.rank(rank, communityCount)}</div>
          <UtilityNav activeView="dashboard" setView={setView} copy={copy} />
        </div>
      </div>

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
    </section>
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

  const popup = window.open("", "ecotrack-imprint", "noopener,noreferrer,width=760,height=860");
  if (!popup) {
    return;
  }

  popup.document.title = copy.imprint.title;
  popup.document.body.innerHTML = `
    <main style="font-family: Avenir Next, Segoe UI, Trebuchet MS, sans-serif; margin: 2rem auto; max-width: 760px; line-height: 1.5; color: #122019; padding: 0 1rem;">
      <h1 style="margin: 0 0 1rem; font-size: 1.8rem;">${copy.imprint.title}</h1>
      <p style="margin: 0;">${copy.imprint.body}</p>
    </main>
  `;
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
  return (
    <details className="required-hint">
      <summary title={text}>!</summary>
      <span>{text}</span>
    </details>
  );
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
    return IS_DEV_BUILD ? ensureSeedData(current) : current;
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = parseStorage(legacyKey);
    if (legacy) {
      return IS_DEV_BUILD ? ensureSeedData(legacy) : legacy;
    }
  }

  return IS_DEV_BUILD ? ensureSeedData(EMPTY_STATE) : EMPTY_STATE;
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
    return IS_DEV_BUILD ? ensureSeedData(EMPTY_STATE) : EMPTY_STATE;
  }

  return {
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
  };
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
    title: activity.title || "Aktivität",
    points: Number(activity.points) || 0,
    note: activity.note || "",
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
    createdByName: proposal.createdByName || "Unbekannt",
    title: proposal.title || "Custom-Aktivität",
    proposedPoints: Number(proposal.proposedPoints) || 0,
    createdAt: proposal.createdAt || new Date().toISOString(),
    votes: proposal.votes && typeof proposal.votes === "object" ? proposal.votes : {},
  };
}

function normalizeActivityRequest(request) {
  return {
    id: request.id || crypto.randomUUID(),
    category: request.category || "custom",
    title: request.title || "Aktivität",
    proposedPoints: Number(request.proposedPoints) || 0,
    createdBy: request.createdBy || "unknown",
    createdByName: request.createdByName || "Unbekannt",
    createdAt: request.createdAt || new Date().toISOString(),
  };
}

function normalizeApprovedActivity(activity) {
  return {
    id: activity.id || crypto.randomUUID(),
    category: activity.category || "custom",
    title: activity.title || "Aktivität",
    points: Number(activity.points) || 0,
    note: activity.note || "",
  };
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProposalAverage(proposal) {
  const values = Object.values(proposal.votes || {}).map((value) => Number(value)).filter(Boolean);
  if (!values.length) {
    return proposal.proposedPoints;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getLevelStats(totalPoints) {
  const pointsPerLevel = 100;
  const level = Math.floor(totalPoints / pointsPerLevel) + 1;
  const nextThreshold = level * pointsPerLevel;
  const progressInLevel = totalPoints % pointsPerLevel;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((progressInLevel / pointsPerLevel) * 100)),
  );

  return {
    level,
    nextThreshold,
    progressPercent,
    pointsToNext: nextThreshold - totalPoints,
    currentLabel: getLevelName(level),
    nextLabel: getLevelName(level + 1),
  };
}

function getLevelName(level) {
  if (level <= LEVEL_NAMES.length) {
    return LEVEL_NAMES[level - 1];
  }

  return `Elite ${level}`;
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
    title: translation,
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
  const rootProgress = level === 1 ? Math.max(0.25, progress / 100) : 1;
  const trunkProgress = level === 1 ? 0.18 : level === 2 ? Math.max(0.2, progress / 100) : 1;
  const canopyTier = Math.max(0, level - 2);
  const canopyFront = canopyTier >= 1 ? 1 : 0;
  const canopyMid = canopyTier >= 2 ? 1 : canopyTier === 1 ? Math.max(0.35, progress / 100) : 0;
  const canopyBack = canopyTier >= 3 ? 1 : canopyTier === 2 ? Math.max(0.35, progress / 100) : 0;
  const branchVisible = level >= 3 ? 1 : level === 2 ? Math.max(0.25, progress / 100) : 0;

  let stageLabel = "";
  if (level === 1) {
    stageLabel = copy.activity.treeStageRoots(progress);
  } else if (level === 2) {
    stageLabel = copy.activity.treeStageTrunk(progress);
  } else {
    stageLabel = copy.activity.treeStageCrown(level);
  }

  return {
    rootStyle: {
      opacity: rootProgress,
      transform: `scaleX(${0.55 + rootProgress * 0.45})`,
    },
    trunkStyle: {
      height: `${36 + trunkProgress * 72}px`,
    },
    branchStyle: {
      opacity: branchVisible,
      transform: `scale(${0.7 + branchVisible * 0.3})`,
    },
    canopyFrontStyle: {
      opacity: canopyFront,
      transform: `scale(${0.65 + canopyFront * 0.35})`,
    },
    canopyMidStyle: {
      opacity: canopyMid,
      transform: `scale(${0.55 + canopyMid * 0.45})`,
    },
    canopyBackStyle: {
      opacity: canopyBack,
      transform: `scale(${0.45 + canopyBack * 0.55})`,
    },
    stageLabel,
  };
}
