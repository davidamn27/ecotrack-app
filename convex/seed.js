import { mutation } from "./_generated/server";

const DAY_MS = 24 * 60 * 60 * 1000;
const TEST_PASSWORD = "test123";
const LOCK_EXISTING_PROFILE_EMAILS = new Set([
  "ammann-jens@web.de",
  "ammann.jan@web.de",
  "elijah.stauss@gmail.com",
  "moritz.kaltenstadler@gmail.com",
]);

function passwordForProfile(profile) {
  return profile.password || TEST_PASSWORD;
}

function calculateAge(birthDate, nowTimestamp) {
  const now = new Date(nowTimestamp);
  const birth = new Date(birthDate);
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = now.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return String(age);
}

function keyFromActivity(activity) {
  return `${activity.category}:${activity.title}`.toLowerCase().trim();
}

function toDateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function toIso(timestamp) {
  return new Date(timestamp).toISOString();
}

function getDayTimestamp(startTimestamp, dayOffset, hour, minute) {
  return startTimestamp + dayOffset * DAY_MS + (hour * 60 + minute) * 60 * 1000;
}

function withNote(activity, profile, variantLabel) {
  const detail = typeof activity.note === "function" ? activity.note(profile) : activity.note;
  const suffix = variantLabel ? ` (${variantLabel})` : "";
  return {
    ...activity,
    note: `${detail}${suffix}`,
  };
}

function buildTwoWeekSchedule(profile, startTimestamp) {
  const schedule = [];

  for (let day = 0; day < 14; day += 1) {
    const weekday = day % 7;
    const variant = day < 7 ? "Woche 1" : "Woche 2";
    const morning = profile.weekdayMorning[weekday] || [];
    const evening = profile.weekdayEvening[weekday] || [];
    const extras = profile.weekdayExtras[weekday] || [];
    const baseActivities = [...morning, ...evening, ...extras];

    const activities =
      weekday === 5 || weekday === 6
        ? profile.weekend[weekday === 5 ? 0 : 1]
        : baseActivities;

    schedule.push(
      ...activities.map((activity, index) => {
        const timestamp = getDayTimestamp(
          startTimestamp,
          day,
          activity.hour ?? 12,
          activity.minute ?? index * 11,
        );

        return {
          ...withNote(activity, profile, variant),
          createdAt: timestamp,
          dateKey: toDateKey(timestamp),
        };
      }),
    );
  }

  return schedule;
}

async function ensureCatalogEntry(ctx, activity) {
  const key = keyFromActivity(activity);
  const existing = await ctx.db
    .query("activities")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      title: activity.title,
      category: activity.category,
      defaultPoints: activity.points,
      note: activity.note,
      isSystem: true,
    });
    return existing._id;
  }

  return await ctx.db.insert("activities", {
    key,
    title: activity.title,
    category: activity.category,
    defaultPoints: activity.points,
    note: activity.note,
    isSystem: true,
    createdAt: Date.now(),
  });
}

function activity(category, title, points, note, hour, minute = 0) {
  return { category, title, points, note, hour, minute };
}

function createId(prefix, index) {
  return `${prefix}-${String(index).padStart(2, "0")}`;
}

function authoredEntry(accountByEmail, email, author, message, createdAt) {
  const account = accountByEmail.get(email);
  if (!account) {
    return null;
  }

  return {
    accountId: account.id,
    author,
    message,
    createdAt,
  };
}

async function removeUserActivityEntries(ctx, userId) {
  const entries = await ctx.db
    .query("activityEntries")
    .withIndex("by_user_created", (q) => q.eq("userId", userId))
    .collect();

  for (const entry of entries) {
    await ctx.db.delete(entry._id);
  }

  return entries.length;
}

async function saveMainAppState(ctx, state, timestamp) {
  const existingAppState = await ctx.db
    .query("appStates")
    .withIndex("by_name", (q) => q.eq("name", "main"))
    .unique();

  if (existingAppState) {
    await ctx.db.patch(existingAppState._id, {
      state,
      updatedAt: timestamp,
    });
    return;
  }

  await ctx.db.insert("appStates", {
    name: "main",
    state,
    updatedAt: timestamp,
  });
}

const profiles = [
  {
    email: "ammann-jens@web.de",
    name: "Jens Ammann",
    city: "Markt Indersdorf",
    age: "30",
    mobilityContext: "ländlicher Alltag mit regelmäßigem Autoeinsatz für Pendelwege und Einkäufe",
    weekdayMorning: [
      [activity("mobility", "Fahrgemeinschaft gebildet", 3, "Pendelt mit Kolleg:innen aus dem Umland", 7, 10)],
      [activity("mobility", "Auto mit mehreren Erledigungen kombiniert", 1, "Bündelt Fahrten statt mehrfach loszufahren", 7, 15)],
      [activity("mobility", "Fahrgemeinschaft gebildet", 3, "Pendelt mit Kolleg:innen aus dem Umland", 7, 5)],
      [activity("mobility", "Homeoffice genutzt", 2, "Spart den langen Pendelweg an einem Arbeitstag", 8, 0)],
      [activity("mobility", "Auto mit mehreren Erledigungen kombiniert", 1, "Verbindet Arbeitsweg und Einkauf", 7, 20)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Selbst gekocht", 2, "Kocht zu Hause statt Take-away auf dem Heimweg", 19, 0)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Schaltet TV und Ladegeräte abends komplett aus", 21, 10)],
      [activity("nutrition", "Regional eingekauft", 3, "Kauft beim Hofladen in der Nähe ein", 18, 30)],
      [activity("household", "Heizung bewusst reduziert", 3, "Senkt die Raumtemperatur am Abend", 21, 0)],
      [activity("nutrition", "Selbst gekocht", 2, "Nutzt vorhandene Vorräte für das Abendessen", 19, 15)],
    ],
    weekdayExtras: [
      [activity("household", "Duschzeit reduziert", 3, "Achtet morgens auf eine kurze Dusche", 6, 30)],
      [],
      [activity("individual", "Mehrwegbecher genutzt", 2, "Nimmt den eigenen Becher mit zur Arbeit", 10, 20)],
      [activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Plant die Wäsche auf den Homeoffice-Tag", 16, 40)],
      [],
    ],
    weekend: [
      [
        activity("mobility", "Kurze Wege mit dem Fahrrad erledigt", 3, "Fährt im Ort mit dem Rad zum Bäcker und Sportplatz", 10, 0),
        activity("nutrition", "Regional eingekauft", 3, "Kauft Gemüse auf dem Wochenmarkt", 11, 40),
        activity("individual", "Gebrauchte Gegenstände weiterverwendet", 2, "Repariert und nutzt Werkzeuge weiter", 16, 0),
      ],
      [
        activity("mobility", "Spaziergang statt Autofahrt gemacht", 2, "Besucht Familie im Ort zu Fuß", 14, 0),
        activity("household", "Standby-Geräte ausgeschaltet", 2, "Macht sonntags den Technik-Check im Haus", 20, 0),
        activity("nutrition", "Selbst gekocht", 2, "Bereitet Essen für Montag mit vor", 18, 30),
      ],
    ],
  },
  {
    email: "ammann.jan@web.de",
    name: "Jan Ammann",
    city: "Dachau",
    age: "27",
    mobilityContext: "S-Bahn- und Fahrradmix mit einzelnen Homeoffice-Tagen",
    weekdayMorning: [
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Fährt mit der S-Bahn nach München", 7, 25)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Legt den Weg zum Bahnhof mit dem Rad zurück", 7, 10)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Nutzt die S-Bahn für den Pendelweg", 7, 25)],
      [activity("mobility", "Homeoffice genutzt", 2, "Arbeitet von zu Hause und spart die Pendelstrecke", 8, 5)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt bei gutem Wetter komplett mit dem Rad", 7, 0)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Vegetarisch gegessen", 3, "Wählt mittags bewusst eine vegetarische Mahlzeit", 12, 20)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Trennt Arbeitsplatz und Router nachts vom Netz", 22, 0)],
      [activity("nutrition", "Selbst gekocht", 2, "Kocht mit Resten vom Vortag", 19, 10)],
      [activity("household", "Duschzeit reduziert", 3, "Kurze Dusche nach dem Sport", 20, 15)],
      [activity("nutrition", "Vegetarisch gegessen", 3, "Freitags bleibt das Essen fleischfrei", 12, 30)],
    ],
    weekdayExtras: [
      [],
      [activity("individual", "Mehrwegflasche genutzt", 1, "Nimmt Wasser in eigener Flasche mit", 9, 10)],
      [activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Wäscht erst bei voller Maschine", 20, 40)],
      [],
      [activity("individual", "Reparatur statt Neukauf", 3, "Flickt am Abend ein Fahrradlicht", 18, 40)],
    ],
    weekend: [
      [
        activity("mobility", "Mit dem Fahrrad zur Stadt gefahren", 2, "Erledigt Besorgungen in Dachau mit dem Rad", 11, 0),
        activity("nutrition", "Regional eingekauft", 3, "Kauft am Markt ein", 11, 50),
        activity("household", "Standby-Geräte ausgeschaltet", 2, "Macht einen Stromspar-Check", 20, 30),
      ],
      [
        activity("mobility", "Spaziergang statt Kurzstrecke gemacht", 2, "Läuft zu Freunden statt das Auto zu nehmen", 15, 0),
        activity("nutrition", "Selbst gekocht", 2, "Kocht für zwei Tage vor", 18, 20),
        activity("individual", "Second-Hand gekauft", 2, "Besorgt Kleidung gebraucht", 16, 10),
      ],
    ],
  },
  {
    email: "elijah.stauss@gmail.com",
    name: "Elijah Stauss",
    city: "München",
    age: "27",
    mobilityContext: "städtischer Alltag mit Fahrrad, U-Bahn und wenig motorisiertem Verkehr",
    weekdayMorning: [
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt quer durch München mit dem Rad", 8, 5)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Nutzt U-Bahn und Tram für Termine", 8, 0)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Nimmt bei trockenem Wetter das Rad", 8, 0)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Erledigt Wege mit U-Bahn statt Auto", 8, 15)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt auch freitags mit dem Rad", 8, 10)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Vegetarisch gegessen", 3, "Bestellt bewusst ein vegetarisches Mittagessen", 12, 15)],
      [activity("nutrition", "Selbst gekocht", 2, "Kocht abends mit saisonalem Gemüse", 19, 5)],
      [activity("household", "Duschzeit reduziert", 3, "Duscht nach dem Sport bewusst kurz", 20, 10)],
      [activity("individual", "Mehrwegbecher genutzt", 2, "Nimmt den eigenen Coffee Cup mit", 10, 10)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Schaltet Konsole und Monitor komplett aus", 22, 0)],
    ],
    weekdayExtras: [
      [activity("individual", "Mehrwegflasche genutzt", 1, "Füllt unterwegs Wasser nach", 9, 30)],
      [],
      [activity("nutrition", "Regional eingekauft", 3, "Kauft auf dem Heimweg am Biomarkt", 18, 30)],
      [],
      [activity("individual", "Second-Hand gekauft", 2, "Kauft ein Buch gebraucht", 17, 40)],
    ],
    weekend: [
      [
        activity("mobility", "Mit dem Fahrrad zu Freizeitaktivitäten gefahren", 2, "Fährt an die Isar mit dem Rad", 11, 0),
        activity("nutrition", "Vegetarisch gegessen", 3, "Bleibt auch am Wochenende vegetarisch", 13, 0),
        activity("individual", "Wiederverwendbare Produkte genutzt", 2, "Nutzt eigene Boxen beim Take-away", 19, 0),
      ],
      [
        activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Fährt mit der U-Bahn statt Mitfahrdienst", 12, 0),
        activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Wäscht gesammelt am Sonntag", 16, 20),
        activity("nutrition", "Selbst gekocht", 2, "Bereitet Lunches für Montag vor", 18, 45),
      ],
    ],
  },
  {
    email: "moritz.kaltenstadler@gmail.com",
    name: "Moritz Kaltenstadler",
    city: "Freising",
    age: "28",
    mobilityContext: "kleinstädtischer Alltag mit Bahn, Fahrrad und gelegentlichen Autofahrten",
    weekdayMorning: [
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Pendelt mit dem Regionalzug", 7, 0)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt zum Bahnhof mit dem Rad", 6, 50)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Fährt für einen Termin nach München", 7, 15)],
      [activity("mobility", "Homeoffice genutzt", 2, "Bleibt für konzentrierte Arbeit zu Hause", 8, 0)],
      [activity("mobility", "Auto mit mehreren Erledigungen kombiniert", 1, "Verbindet Heimweg und Einkauf", 7, 10)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Selbst gekocht", 2, "Kocht nach dem Pendeln zu Hause", 19, 20)],
      [activity("household", "Heizung bewusst reduziert", 3, "Senkt abends die Temperatur", 21, 15)],
      [activity("nutrition", "Vegetarisch gegessen", 3, "Hält einen vegetarischen Tag ein", 12, 10)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Schaltet Computer und Drucker ab", 21, 40)],
      [activity("individual", "Reparatur statt Neukauf", 3, "Pflegt und repariert Alltagsgegenstände", 18, 15)],
    ],
    weekdayExtras: [
      [],
      [activity("individual", "Mehrwegflasche genutzt", 1, "Hat die Flasche im Zug dabei", 9, 30)],
      [],
      [activity("household", "Duschzeit reduziert", 3, "Spart Wasser am Homeoffice-Tag", 7, 20)],
      [activity("nutrition", "Regional eingekauft", 3, "Kauft in Freising regional ein", 18, 10)],
    ],
    weekend: [
      [
        activity("mobility", "Kurze Wege zu Fuß erledigt", 2, "Geht am Samstag in die Innenstadt", 10, 30),
        activity("nutrition", "Selbst gekocht", 2, "Kocht mit regionalen Zutaten", 18, 0),
        activity("individual", "Second-Hand gekauft", 2, "Kauft Elektronik gebraucht", 15, 10),
      ],
      [
        activity("mobility", "Mit dem Fahrrad Freunde besucht", 2, "Nutzt das Rad für Freizeitwege", 14, 0),
        activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Wäscht gesammelt am Sonntag", 16, 30),
        activity("nutrition", "Vegetarisch gegessen", 3, "Plant einen fleischfreien Sonntag", 12, 15),
      ],
    ],
  },
  {
    email: "jana.ammann@web.de",
    name: "Jana Ammann",
    city: "München",
    age: calculateAge("1998-08-17", Date.now()),
    password: "JanaAmmann98!",
    mobilityContext: "Münchner Alltagsroutine mit Rad, Tram und konsequent nachhaltigem Konsum",
    weekdayMorning: [
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt morgens mit dem Rad durch München", 8, 10)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Nimmt die Tram bei schlechtem Wetter", 8, 5)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Fährt zur Arbeit und zu Terminen per Rad", 8, 0)],
      [activity("mobility", "Homeoffice genutzt", 2, "Arbeitet einen Tag pro Woche von zu Hause", 8, 0)],
      [activity("mobility", "Mit dem Fahrrad zur Arbeit", 2, "Erledigt den Freitag komplett mit dem Rad", 8, 0)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Vegetarisch gegessen", 3, "Isst unter der Woche überwiegend vegetarisch", 12, 20)],
      [activity("nutrition", "Selbst gekocht", 2, "Kocht frisch statt zu bestellen", 19, 15)],
      [activity("individual", "Mehrwegbecher genutzt", 2, "Nimmt den eigenen Becher ins Cafe mit", 10, 30)],
      [activity("household", "Duschzeit reduziert", 3, "Achtet auf kurze Duschen", 20, 10)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Schaltet Laptop und Ladegeräte vollständig aus", 22, 10)],
    ],
    weekdayExtras: [
      [activity("individual", "Mehrwegflasche genutzt", 1, "Hat immer eine Trinkflasche dabei", 9, 0)],
      [],
      [activity("nutrition", "Regional eingekauft", 3, "Kauft auf dem Viktualienmarkt ein", 18, 20)],
      [],
      [activity("individual", "Second-Hand gekauft", 2, "Kauft Kleidung gebraucht", 17, 30)],
    ],
    weekend: [
      [
        activity("mobility", "Mit dem Fahrrad in die Stadt gefahren", 2, "Erledigt Einkäufe in München mit dem Rad", 11, 10),
        activity("nutrition", "Regional eingekauft", 3, "Besucht den Wochenmarkt", 12, 0),
        activity("individual", "Wiederverwendbare Produkte genutzt", 2, "Verwendet Stoffbeutel und Boxen", 16, 30),
      ],
      [
        activity("mobility", "Spaziergang statt Kurzstrecke gemacht", 2, "Läuft am Sonntag in den Park", 14, 30),
        activity("nutrition", "Selbst gekocht", 2, "Kocht für die Woche vor", 18, 30),
        activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Wäscht gesammelt und energiesparend", 16, 0),
      ],
    ],
  },
  {
    email: "lisa-ammann@web.de",
    name: "Lisa Ammann",
    city: "München",
    age: calculateAge("2000-08-18", Date.now()),
    password: "LisaAmmann00!",
    mobilityContext: "urbaner Alltag mit viel ÖPNV, zu Fuß und konsequenter Mehrweg-Nutzung",
    weekdayMorning: [
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Fährt täglich mit U-Bahn und Bus", 8, 15)],
      [activity("mobility", "Zu Fuß zur Uni gegangen", 2, "Geht kurze Wege bewusst zu Fuß", 8, 0)],
      [activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Nutzt die Tram für Vorlesung und Arbeit", 8, 10)],
      [activity("mobility", "Homeoffice genutzt", 2, "Arbeitet und lernt an einem Tag von zu Hause", 8, 20)],
      [activity("mobility", "Zu Fuß zur Uni gegangen", 2, "Verbindet Uni und Besorgungen zu Fuß", 8, 5)],
    ],
    weekdayEvening: [
      [activity("nutrition", "Vegetarisch gegessen", 3, "Entscheidet sich in der Mensa vegetarisch", 12, 5)],
      [activity("individual", "Mehrwegbecher genutzt", 2, "Kauft Kaffee nur im eigenen Becher", 10, 45)],
      [activity("nutrition", "Selbst gekocht", 2, "Kocht abends mit Freunden", 19, 0)],
      [activity("household", "Standby-Geräte ausgeschaltet", 2, "Trennt Technik abends vom Strom", 22, 10)],
      [activity("household", "Duschzeit reduziert", 3, "Hält die Dusche bewusst kurz", 20, 30)],
    ],
    weekdayExtras: [
      [activity("individual", "Mehrwegflasche genutzt", 1, "Nimmt Leitungswasser in eigener Flasche mit", 9, 20)],
      [],
      [activity("nutrition", "Regional eingekauft", 3, "Kauft frische Lebensmittel regional ein", 18, 0)],
      [],
      [activity("individual", "Second-Hand gekauft", 2, "Findet Dinge gebraucht statt neu", 17, 45)],
    ],
    weekend: [
      [
        activity("mobility", "Öffentliche Verkehrsmittel genutzt", 3, "Fährt am Samstag mit der Tram in die Stadt", 11, 30),
        activity("nutrition", "Vegetarisch gegessen", 3, "Bleibt am Wochenende vegetarisch", 13, 10),
        activity("individual", "Wiederverwendbare Produkte genutzt", 2, "Nutzt Mehrwegboxen und Stofftaschen", 16, 15),
      ],
      [
        activity("mobility", "Spaziergang statt Kurzstrecke gemacht", 2, "Geht am Sonntag zu Freunden", 14, 10),
        activity("nutrition", "Selbst gekocht", 2, "Kocht Essen für die neue Woche vor", 18, 20),
        activity("household", "Wäsche im Eco-Modus gewaschen", 2, "Wäscht erst bei voller Maschine", 15, 40),
      ],
    ],
  },
];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const startDate = new Date(now - 13 * DAY_MS);
    startDate.setUTCHours(6, 0, 0, 0);
    const startTimestamp = startDate.getTime();

    const targetUsers = [];
    const skippedExistingProfiles = [];
    let usersCreated = 0;
    let usersUpdated = 0;

    for (const profile of profiles) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", profile.email))
        .unique();
      const shouldPreserveProfile = LOCK_EXISTING_PROFILE_EMAILS.has(profile.email);

      let userId;
      if (existing) {
        await ctx.db.patch(existing._id, shouldPreserveProfile
          ? {
              surveySurveyCompleted: true,
            }
          : {
              name: profile.name,
              email: profile.email,
              city: profile.city,
              age: profile.age,
              password: passwordForProfile(profile),
              surveySurveyCompleted: true,
            });
        userId = existing._id;
        usersUpdated += 1;
      } else if (shouldPreserveProfile) {
        skippedExistingProfiles.push({
          email: profile.email,
          name: profile.name,
        });
        continue;
      } else {
        userId = await ctx.db.insert("users", {
          name: profile.name,
          email: profile.email,
          city: profile.city,
          age: profile.age,
          password: passwordForProfile(profile),
          surveySurveyCompleted: true,
          createdAt: now,
        });
        usersCreated += 1;
      }

      targetUsers.push({
        userId,
        profile: existing && LOCK_EXISTING_PROFILE_EMAILS.has(profile.email)
          ? {
              ...profile,
              name: existing.name,
              city: existing.city,
              age: existing.age,
              password: existing.password,
              createdAt: existing.createdAt,
            }
          : profile,
      });
    }

    const targetUserIds = new Set(targetUsers.map(({ userId }) => String(userId)));
    const existingEntries = await ctx.db.query("activityEntries").collect();
    let deletedEntries = 0;
    for (const entry of existingEntries) {
      if (targetUserIds.has(String(entry.userId))) {
        await ctx.db.delete(entry._id);
        deletedEntries += 1;
      }
    }

    const catalogIds = new Map();
    const appStateAccounts = [];
    let activitiesCreated = 0;

    for (const { userId, profile } of targetUsers) {
      const schedule = buildTwoWeekSchedule(profile, startTimestamp);
      const normalizedActivities = [];

      for (const entry of schedule) {
        const key = keyFromActivity(entry);
        if (!catalogIds.has(key)) {
          const activityId = await ensureCatalogEntry(ctx, entry);
          catalogIds.set(key, activityId);
        }

        await ctx.db.insert("activityEntries", {
          userId,
          activityId: catalogIds.get(key),
          category: entry.category,
          title: entry.title,
          points: entry.points,
          note: entry.note,
          dateKey: entry.dateKey,
          createdAt: entry.createdAt,
        });
        normalizedActivities.unshift({
          id: `${String(userId)}-${entry.dateKey}-${activitiesCreated + 1}`,
          category: entry.category,
          title: entry.title,
          points: entry.points,
          note: entry.note,
          createdAt: toIso(entry.createdAt),
        });
        activitiesCreated += 1;
      }

      appStateAccounts.push({
        id: userId,
        backendUserId: userId,
        name: profile.name,
        email: profile.email,
        city: profile.city,
        age: profile.age,
        password: passwordForProfile(profile),
        createdAt: toIso(now),
        activities: normalizedActivities,
      });

    }

    const accountByEmail = new Map(appStateAccounts.map((account) => [account.email, account]));
    const oneDay = startTimestamp + DAY_MS;
    const chatMessages = [
      authoredEntry(accountByEmail, "jana.ammann@web.de", "Jana Ammann", "Ich finde es hilfreich, dass man die Wege wirklich nachhalten kann. In München sieht man sofort, wie oft Fahrrad und Tram den Alltag tragen.", toIso(oneDay + 8 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "ammann-jens@web.de", "Jens Ammann", "Bei mir auf dem Land geht ohne Auto nicht alles, aber ich kombiniere jetzt mehr Erledigungen und bilde öfter Fahrgemeinschaften. Das macht in den Punkten auch Sinn.", toIso(oneDay + 9 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "elijah.stauss@gmail.com", "Elijah Stauss", "Der Vergleich Stadt zu Umland ist spannend. Bei mir sind OePNV und Fahrrad fast immer die besten Optionen.", toIso(oneDay + 11 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "moritz.kaltenstadler@gmail.com", "Moritz Kaltenstadler", "Ich mag, dass auch kleine Dinge wie Mehrwegflasche oder Eco-Wäsche zählen. Das fühlt sich realistischer an als nur große Aktionen.", toIso(oneDay + 13 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "lisa-ammann@web.de", "Lisa Ammann", "Die Wochenansicht motiviert mich gerade voll. Vor allem wenn man sieht, dass viele kleine nachhaltige Entscheidungen zusammenkommen.", toIso(oneDay + 16 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "ammann.jan@web.de", "Jan Ammann", "Ich würde für Pendler noch kombinierte Wege stärker hervorheben. Gerade Bahn plus Fahrrad passt für Dachau ziemlich gut.", toIso(oneDay + 18 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "jana.ammann@web.de", "Jana Ammann", "Wochenmarkt und Meal-Prep sind bei mir inzwischen fester Teil der Routine. Das sieht man in der Verlaufskurve ganz gut.", toIso(oneDay + 2 * DAY_MS + 10 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "ammann-jens@web.de", "Jens Ammann", "Homeoffice an einzelnen Tagen hilft bei mir enorm. Dann fällt der lange Pendelweg komplett weg.", toIso(oneDay + 3 * DAY_MS + 8 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "elijah.stauss@gmail.com", "Elijah Stauss", "Vielleicht könnte man noch anzeigen, welche Kategorie in den letzten 7 Tagen am stärksten war.", toIso(oneDay + 4 * DAY_MS + 12 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "lisa-ammann@web.de", "Lisa Ammann", "Ich finde gut, dass nicht jede nachhaltige Aktivität gleich viele Punkte hat. Das wirkt nachvollziehbar.", toIso(oneDay + 5 * DAY_MS + 17 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "moritz.kaltenstadler@gmail.com", "Moritz Kaltenstadler", "Freising ist so ein Mittelding: mal Zug, mal Fahrrad, manchmal doch Auto. Genau deshalb taugt die App gut als Vergleichsbasis.", toIso(oneDay + 7 * DAY_MS + 9 * 60 * 60 * 1000)),
      authoredEntry(accountByEmail, "ammann.jan@web.de", "Jan Ammann", "Die Exportfunktion könnte für die Auswertung richtig praktisch sein. Vor allem wenn man die 14 Tage sauber vergleichen will.", toIso(oneDay + 8 * DAY_MS + 18 * 60 * 60 * 1000)),
    ]
      .filter(Boolean)
      .map((entry, index) => ({
        id: createId("chat", index + 1),
        ...entry,
      }))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const activityRequests = [
      accountByEmail.get("ammann.jan@web.de") && {
        category: "mobility",
        title: "Park and Ride statt Direktfahrt",
        proposedPoints: 2,
        createdBy: accountByEmail.get("ammann.jan@web.de").id,
        createdByName: "Jan Ammann",
        createdAt: toIso(oneDay + 6 * DAY_MS + 15 * 60 * 60 * 1000),
      },
      accountByEmail.get("jana.ammann@web.de") && {
        category: "nutrition",
        title: "Wochenmenü geplant statt spontane Bestellung",
        proposedPoints: 2,
        createdBy: accountByEmail.get("jana.ammann@web.de").id,
        createdByName: "Jana Ammann",
        createdAt: toIso(oneDay + 7 * DAY_MS + 14 * 60 * 60 * 1000),
      },
      accountByEmail.get("moritz.kaltenstadler@gmail.com") && {
        category: "household",
        title: "Steckdosenleiste mit Schalter konsequent genutzt",
        proposedPoints: 2,
        createdBy: accountByEmail.get("moritz.kaltenstadler@gmail.com").id,
        createdByName: "Moritz Kaltenstadler",
        createdAt: toIso(oneDay + 9 * DAY_MS + 10 * 60 * 60 * 1000),
      },
      accountByEmail.get("lisa-ammann@web.de") && {
        category: "individual",
        title: "Leitungswasser unterwegs nachgefüllt",
        proposedPoints: 1,
        createdBy: accountByEmail.get("lisa-ammann@web.de").id,
        createdByName: "Lisa Ammann",
        createdAt: toIso(oneDay + 10 * DAY_MS + 11 * 60 * 60 * 1000),
      },
    ]
      .filter(Boolean)
      .map((entry, index) => ({
        id: createId("request", index + 1),
        ...entry,
      }))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const approvedActivities = [
      {
        id: "approved-01",
        category: "mobility",
        title: "Mitfahrgelegenheit statt Einzelfahrt genutzt",
        points: 3,
        note: "Nutzt vorhandene Fahrten besser aus und spart gegenüber einer Einzelfahrt Ressourcen.",
      },
      {
        id: "approved-02",
        category: "nutrition",
        title: "Resteessen geplant verwertet",
        points: 2,
        note: "Verhindert Lebensmittelverschwendung durch geplante Resteverwertung.",
      },
      {
        id: "approved-03",
        category: "individual",
        title: "Eigene Mehrwegbox für Take-away genutzt",
        points: 2,
        note: "Reduziert Einwegverpackungen im Alltag.",
      },
    ];

    const seededState = {
      accounts: appStateAccounts,
      activeAccountId: null,
      chatMessages,
      customProposals: [],
      activityRequests,
      approvedActivities,
    };
    await saveMainAppState(ctx, seededState, now);

    return {
      ok: true,
      usersCreated,
      usersUpdated,
      deletedEntries,
      activitiesCreated,
      defaultPassword: TEST_PASSWORD,
      seededPasswords: profiles
        .filter((profile) => !LOCK_EXISTING_PROFILE_EMAILS.has(profile.email))
        .map((profile) => ({
          email: profile.email,
          password: passwordForProfile(profile),
        })),
      skippedExistingProfiles,
      chatMessagesCreated: chatMessages.length,
      activityRequestsCreated: activityRequests.length,
      approvedActivitiesCreated: approvedActivities.length,
      seededUsers: profiles.map((profile) => ({
        name: profile.name,
        email: profile.email,
        city: profile.city,
        age: profile.age,
        mobilityContext: profile.mobilityContext,
      })),
      message: "Referenznutzer mit plausiblen 14 Tagen Aktivität erfolgreich angelegt",
    };
  },
});

export const cleanupProtectedProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const protectedEmails = [...LOCK_EXISTING_PROFILE_EMAILS];
    const removedUsers = [];
    const deletedUserIds = new Set();
    let deletedEntries = 0;
    for (const email of protectedEmails) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      if (!user) {
        continue;
      }

      deletedEntries += await removeUserActivityEntries(ctx, user._id);
      await ctx.db.delete(user._id);
      deletedUserIds.add(String(user._id));
      removedUsers.push({
        email: user.email,
        name: user.name,
      });
    }

    const existingAppState = await ctx.db
      .query("appStates")
      .withIndex("by_name", (q) => q.eq("name", "main"))
      .unique();

    if (existingAppState) {
      const state = existingAppState.state || {};
      const cleanedState = {
        ...state,
        activeAccountId: deletedUserIds.has(String(state.activeAccountId)) ? null : state.activeAccountId || null,
        accounts: Array.isArray(state.accounts)
          ? state.accounts.filter((account) => !deletedUserIds.has(String(account.id)))
          : [],
        chatMessages: Array.isArray(state.chatMessages)
          ? state.chatMessages.filter((entry) => !deletedUserIds.has(String(entry.accountId)))
          : [],
        customProposals: Array.isArray(state.customProposals)
          ? state.customProposals.filter((proposal) => !deletedUserIds.has(String(proposal.createdBy)))
          : [],
        activityRequests: Array.isArray(state.activityRequests)
          ? state.activityRequests.filter((request) => !deletedUserIds.has(String(request.createdBy)))
          : [],
        approvedActivities: Array.isArray(state.approvedActivities) ? state.approvedActivities : [],
      };
      await saveMainAppState(ctx, cleanedState, Date.now());
    }

    return {
      ok: true,
      removedUsers,
      deletedEntries,
    };
  },
});
