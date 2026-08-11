Below is a **Cursor/LLM-ready Markdown doc** you can paste straight into your repo.

````md
# PDR: Interaction Lab Calendar Display — Fixture Schedule View

## 1. Purpose

We are creating a new lab item at:

`/sandbox/interaction-lab/calendar/display`

This is a **calendar display experiment**, not a calendar input.

The goal is to test how Fixtura can display fixtures, matches, events, and scheduled sports content across dates using a full calendar UI. This is different from the existing shadcn calendar/date picker, which is mainly used for selecting a date or range.

This lab should help us evaluate whether FullCalendar is a good fit for showing a club or association’s fixtures over a month, season, or year.

---

## 2. What We Are Building

We want a sandbox page that demonstrates multiple calendar display variations using fixture-style data.

The calendar should show hardcoded fixture events such as:

- Grade / competition name
- Home team
- Away team
- Date
- Optional time
- Venue
- Fixture status
- Optional result/content status later

Example use case:

> A club admin opens a schedule calendar and can see which fixtures are happening on which dates. They can click a fixture to view more details.

This is not intended to save data yet. It is purely a UI/UX and package capability test.

---

## 3. Recommended Package

Use **FullCalendar**.

FullCalendar has an official React connector and supports event-based calendar display through plugins such as DayGrid, TimeGrid, List, Interaction, and MultiMonth. The official React docs describe the React component as matching the standard FullCalendar API. FullCalendar’s month view is called `dayGridMonth`, and the MultiMonth plugin supports a `multiMonthYear` view for displaying a year as a grid.  
References:

- FullCalendar React docs: https://fullcalendar.io/docs/react
- FullCalendar Month View docs: https://fullcalendar.io/docs/month-view
- FullCalendar MultiMonth Grid docs: https://fullcalendar.io/docs/multimonth-grid
- Official React example: https://stackblitz.com/github/fullcalendar/fullcalendar-examples/tree/main/react18

---

## 4. Why FullCalendar

FullCalendar is the best first test because it gives us a real event display calendar out of the box.

It supports:

- Month calendar display
- Event rendering inside date cells
- Event click handlers
- Date click handlers
- Custom event content
- Month/week/day/list/year-style variations
- Toolbar navigation
- Responsive behaviour
- Integration with React components
- Custom styling through class names and CSS

This should let us quickly test whether a fixture calendar is viable before building any custom Fixtura-specific calendar system.

---

## 5. Important Distinction

We already use shadcn’s calendar component.

That component is useful for:

- Selecting a date
- Selecting a date range
- Filtering by date
- Small form controls

This new lab item is different.

This new feature is for:

- Displaying many fixtures across dates
- Showing match/event cards inside calendar cells
- Navigating months/seasons
- Clicking fixture items for details
- Testing a year or season overview

Do not try to force the shadcn date picker to become the full fixture calendar display.

---

## 6. Installation

Install FullCalendar and the plugins we want to test.

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid @fullcalendar/list @fullcalendar/multimonth
```
````

### Required packages

```txt
@fullcalendar/react
@fullcalendar/core
@fullcalendar/daygrid
@fullcalendar/interaction
```

### Optional but recommended for testing variations

```txt
@fullcalendar/timegrid
@fullcalendar/list
@fullcalendar/multimonth
```

### Why each package is included

| Package                     | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `@fullcalendar/react`       | React component wrapper                                             |
| `@fullcalendar/core`        | Core calendar engine                                                |
| `@fullcalendar/daygrid`     | Month/grid style views, including `dayGridMonth`                    |
| `@fullcalendar/interaction` | Click handlers, date selection, drag/drop-style interaction support |
| `@fullcalendar/timegrid`    | Week/day time-based calendar views                                  |
| `@fullcalendar/list`        | Agenda/list-style fixture display                                   |
| `@fullcalendar/multimonth`  | Multi-month/year display, useful for season overview testing        |

---

## 7. Route

Create or update this route:

```txt
/sandbox/interaction-lab/calendar/display
```

Suggested App Router path:

```txt
app/(public)/sandbox/interaction-lab/calendar/display/page.tsx
```

Adjust the route group if the current project structure differs.

---

## 8. Page Objective

The page should become a lab page for testing FullCalendar fixture display options.

It should include:

1. Page heading
2. Short explanation
3. A view selector
4. Fixture calendar display
5. Optional fixture detail dialog/sheet
6. Notes area explaining what is being tested

This is a lab page, so it can use hardcoded data.

No API connection is required at this stage.

---

## 9. Suggested Page Copy

### Page Title

```txt
Calendar Display Lab
```

### Page Description

```txt
Testing full calendar schedule displays for Fixtura fixtures, matches, and season-based content. This lab is for displaying events across dates, not selecting dates as an input.
```

---

## 10. Variations To Test

The goal is to test as many useful calendar display modes as possible before deciding what should become reusable.

### Variation 1: Basic Month Fixture Calendar

Use FullCalendar `dayGridMonth`.

Purpose:

- Test the standard month fixture display.
- Show multiple fixtures on a single date.
- Test event overflow behaviour.
- Test visual density.

This should be the default lab view.

Expected behaviour:

- Render fixtures inside the calendar cells.
- Show month navigation.
- Show today button.
- Show fixture pills/cards.
- Clicking a fixture opens details.

---

### Variation 2: Month Calendar With Custom Fixture Pills

Still use `dayGridMonth`, but customise event rendering.

Purpose:

- Test whether fixtures can look more like Fixtura UI cards/pills.
- Show grade, teams, or status in a more branded way.
- Test visual readability.

Example fixture pill content:

```txt
First Grade
Norths vs Souths
```

or

```txt
U14 — Sharks vs Tigers
```

---

### Variation 3: Fixture Detail Dialog

Use shadcn `Dialog` or `Sheet`.

Purpose:

- Test what happens when a user clicks a fixture.
- Display more complete fixture data.
- Keep the calendar clean while allowing deeper inspection.

The detail UI should show:

- Grade
- Home team
- Away team
- Date
- Time
- Venue
- Status
- Optional notes

No editing is required.

---

### Variation 4: List / Agenda View

Use FullCalendar `list` plugin.

Purpose:

- Test whether a list-based fixture display is better for mobile or high-density schedules.
- This may be useful for “upcoming fixtures” views.
- This may also be useful as a companion view beside a calendar.

Suggested views:

```ts
listWeek;
listMonth;
```

---

### Variation 5: Week / Day TimeGrid View

Use FullCalendar `timegrid` plugin.

Purpose:

- Test whether time-based fixture display is useful.
- This may be more relevant for sports with many games across a day.
- It may also be useful if the schedule has exact match times.

Suggested views:

```ts
timeGridWeek;
timeGridDay;
```

This may be less important for Fixtura than month/year display, but it is worth testing while the package is installed.

---

### Variation 6: Multi-Month / Year View

Use FullCalendar `multimonth` plugin.

Purpose:

- Test whether FullCalendar can support a season/year overview.
- The `multiMonthYear` view displays a year-style grid of months.
- This may be useful for viewing a whole season at a glance.

Suggested view:

```ts
multiMonthYear;
```

Important note:

The year view may become visually dense if there are many fixtures. This variation is useful for testing, but we may later decide that Fixtura needs a custom season overview instead.

---

### Variation 7: Calendar + Fixture List Combo

Use `dayGridMonth` plus a custom shadcn card/list beside or below the calendar.

Purpose:

- Test a practical Fixtura layout.
- Calendar gives date context.
- Fixture list gives readable detail.
- Clicking a date can filter the list.
- Clicking a fixture opens the detail dialog.

This may become the best production pattern.

Example layout:

```txt
[ Calendar Month View ]

[ Selected Date Fixtures ]
- First Grade vs Souths
- U15 Sharks vs Tigers
- Masters vs Easts
```

Desktop could use two columns.

Mobile should stack.

---

### Variation 8: Season Overview Concept

This may be custom rather than FullCalendar.

Purpose:

- Test whether we need a simpler Fixtura-specific year/season display.
- Show 12 compact months or a season range.
- Use dots/counts instead of full fixture titles.
- Clicking a month opens the richer calendar view.

This does not need to be fully built first, but the lab should leave room for this concept.

---

## 11. Recommended Initial Lab Views

Start with these views enabled in FullCalendar:

```ts
headerToolbar={{
  left: "prev,next today",
  center: "title",
  right: "dayGridMonth,multiMonthYear,listMonth,timeGridWeek"
}}
```

Use these plugins:

```ts
plugins={[
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
]}
```

Set initial view:

```ts
initialView = "dayGridMonth";
```

---

## 12. Suggested Data Model

Create a local hardcoded fixture array.

Suggested file:

```txt
app/(public)/sandbox/interaction-lab/calendar/display/_data/fixture-events.ts
```

or, if the project prefers shared lab data:

```txt
src/features/interaction-lab/calendar-display/data/fixture-events.ts
```

Example model:

```ts
export type FixtureStatus = "scheduled" | "completed" | "postponed" | "abandoned";

export type FixtureCalendarEvent = {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  extendedProps: {
    grade: string;
    competition: string;
    homeTeam: string;
    awayTeam: string;
    venue?: string;
    status: FixtureStatus;
    round?: string;
    organisation?: string;
  };
};
```

Example data:

```ts
export const fixtureEvents: FixtureCalendarEvent[] = [
  {
    id: "fixture-001",
    title: "First Grade: Norths vs Souths",
    date: "2026-09-12",
    allDay: true,
    extendedProps: {
      grade: "First Grade",
      competition: "Senior Cricket",
      homeTeam: "Norths",
      awayTeam: "Souths",
      venue: "Main Oval",
      status: "scheduled",
      round: "Round 1",
      organisation: "North Coast Cricket Club",
    },
  },
  {
    id: "fixture-002",
    title: "U15: Sharks vs Tigers",
    date: "2026-09-12",
    allDay: true,
    extendedProps: {
      grade: "U15",
      competition: "Junior Cricket",
      homeTeam: "Sharks",
      awayTeam: "Tigers",
      venue: "Junior Oval 2",
      status: "scheduled",
      round: "Round 1",
      organisation: "North Coast Cricket Club",
    },
  },
  {
    id: "fixture-003",
    title: "Masters: Easts vs Wests",
    date: "2026-09-13",
    allDay: true,
    extendedProps: {
      grade: "Masters",
      competition: "Masters Cricket",
      homeTeam: "Easts",
      awayTeam: "Wests",
      venue: "Community Oval",
      status: "scheduled",
      round: "Round 1",
      organisation: "North Coast Cricket Club",
    },
  },
  {
    id: "fixture-004",
    title: "Second Grade: Lions vs Bears",
    date: "2026-09-19",
    allDay: true,
    extendedProps: {
      grade: "Second Grade",
      competition: "Senior Cricket",
      homeTeam: "Lions",
      awayTeam: "Bears",
      venue: "Main Oval",
      status: "completed",
      round: "Round 2",
      organisation: "North Coast Cricket Club",
    },
  },
  {
    id: "fixture-005",
    title: "U13: Falcons vs Eagles",
    date: "2026-09-20",
    allDay: true,
    extendedProps: {
      grade: "U13",
      competition: "Junior Cricket",
      homeTeam: "Falcons",
      awayTeam: "Eagles",
      venue: "Junior Oval 1",
      status: "postponed",
      round: "Round 2",
      organisation: "North Coast Cricket Club",
    },
  },
];
```

---

## 13. Component Structure

Suggested structure:

```txt
calendar/display/
  page.tsx
  _components/
    calendar-display-lab.tsx
    fixture-calendar.tsx
    fixture-detail-dialog.tsx
    fixture-view-controls.tsx
    selected-date-fixtures.tsx
  _data/
    fixture-events.ts
  _types/
    fixture-calendar.types.ts
```

### `page.tsx`

Responsibilities:

- Render page wrapper.
- Render heading and description.
- Render `CalendarDisplayLab`.

### `calendar-display-lab.tsx`

Responsibilities:

- Own lab-level state.
- Track selected event.
- Track selected date if needed.
- Render view notes.
- Render the calendar component.

### `fixture-calendar.tsx`

Responsibilities:

- Render FullCalendar.
- Receive events as props.
- Handle event clicks.
- Handle date clicks.
- Define plugins/views.
- Customise event rendering.

### `fixture-detail-dialog.tsx`

Responsibilities:

- Show selected fixture details.
- Use shadcn `Dialog` or `Sheet`.
- No edit/save action needed.

### `selected-date-fixtures.tsx`

Responsibilities:

- Optional companion list.
- Shows fixtures for clicked/selected date.
- Useful for testing calendar + list layout.

---

## 14. FullCalendar Base Example

Create a client component.

```tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";

import type { EventClickArg, DateClickArg } from "@fullcalendar/core";

import { fixtureEvents } from "../_data/fixture-events";

export function FixtureCalendar() {
  function handleEventClick(arg: EventClickArg) {
    console.log("Fixture clicked:", arg.event);
  }

  function handleDateClick(arg: DateClickArg) {
    console.log("Date clicked:", arg.dateStr);
  }

  return (
    <div className="bg-background rounded-2xl border p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, multiMonthPlugin]}
        initialView="dayGridMonth"
        events={fixtureEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,multiMonthYear,listMonth,timeGridWeek",
        }}
      />
    </div>
  );
}
```

---

## 15. Custom Event Rendering

Use FullCalendar’s event content rendering to make fixture items look closer to Fixtura UI.

Example:

```tsx
eventContent={(eventInfo) => {
  const props = eventInfo.event.extendedProps;

  return (
    <div className="truncate rounded-md px-1.5 py-1 text-xs">
      <div className="font-medium">{props.grade}</div>
      <div className="truncate opacity-80">
        {props.homeTeam} vs {props.awayTeam}
      </div>
    </div>
  );
}}
```

This should be tested carefully for month view because date cells can become crowded.

---

## 16. Fixture Detail Dialog

When the user clicks a fixture, open a shadcn dialog.

Suggested fields:

```txt
Grade
Competition
Home Team
Away Team
Venue
Round
Status
Date
```

Suggested behaviour:

- Click fixture
- Store selected fixture in state
- Open dialog
- Close dialog resets selection

No edit action is needed.

---

## 17. Selected Date Behaviour

When the user clicks a date cell, we should optionally show fixtures for that selected date.

This tests a useful Fixtura pattern:

```txt
Calendar gives visual context.
Below or beside it, a clean list shows the fixtures for the selected day.
```

Suggested state:

```ts
const [selectedDate, setSelectedDate] = useState<string | null>(null);
```

Date click handler:

```ts
function handleDateClick(arg: DateClickArg) {
  setSelectedDate(arg.dateStr);
}
```

Filter:

```ts
const selectedDateFixtures = fixtureEvents.filter((event) => {
  return event.date === selectedDate || event.start?.startsWith(selectedDate ?? "");
});
```

---

## 18. Styling Notes

FullCalendar ships its own default styling. We need to test how much styling is required to make it feel acceptable inside the Fixtura app.

Initial styling goals:

- Place calendar inside a shadcn-style card container.
- Keep spacing consistent with other lab pages.
- Use rounded containers.
- Avoid heavy visual customisation at first.
- Add custom fixture event content only after base rendering works.

Potential wrapper:

```tsx
<div className="space-y-6">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">Calendar Display Lab</h1>
    <p className="text-muted-foreground">Testing fixture schedule display options for Fixtura.</p>
  </div>

  <div className="bg-card rounded-2xl border p-4 shadow-sm">
    <FixtureCalendar />
  </div>
</div>
```

---

## 19. CSS Import

FullCalendar versions differ in how CSS is handled.

Start by checking whether the installed version requires explicit CSS imports.

If needed, add imports near the calendar component or global CSS setup.

Possible imports to test:

```ts
import "@fullcalendar/core/index.css";
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";
import "@fullcalendar/list/index.css";
import "@fullcalendar/multimonth/index.css";
```

If the package version does not expose those paths, remove them and rely on the package’s current documented styling approach.

Do not over-invest in styling until the base package works.

---

## 20. Interaction Lab UX

The lab page should explain what is being tested.

Suggested sections:

```txt
Calendar Display Lab
Testing FullCalendar as a fixture schedule display for Fixtura.

Test Areas:
- Month fixture calendar
- Custom fixture rendering
- Fixture detail dialog
- Date click behaviour
- List/agenda view
- Week view
- Year/multi-month overview
```

Optional UI:

- Small status badges showing which variations are currently enabled.
- Notes panel explaining findings.
- Hardcoded fixture count.
- Selected date display.

---

## 21. Recommended UI Controls

Add basic controls if useful:

### View mode explanation cards

```txt
Month View
Best for standard fixture display.

List View
Best for mobile or upcoming fixtures.

Week View
Useful only if exact fixture times matter.

Year View
Useful for season overview testing.
```

### Fixture density test buttons

Optional:

```txt
Low density
Medium density
High density
```

This would allow us to test how the calendar behaves with lots of fixtures.

For the first implementation, hardcoded data is enough.

---

## 22. Acceptance Criteria

The lab is complete when:

- The route `/sandbox/interaction-lab/calendar/display` exists.
- FullCalendar is installed and renders in the route.
- The default view is `dayGridMonth`.
- Hardcoded fixture events display on dates.
- Multiple events can appear on the same date.
- Calendar navigation works.
- At least these views are available:
  - `dayGridMonth`
  - `listMonth`
  - `timeGridWeek`
  - `multiMonthYear`

- Clicking a fixture opens a shadcn dialog or sheet with fixture details.
- Clicking a date can optionally show selected date fixtures.
- The code is isolated to the interaction lab and does not affect production flows.
- No API or CMS dependency is required.

---

## 23. Definition of Done

The implementation is done when a developer can open:

```txt
/sandbox/interaction-lab/calendar/display
```

and visually test:

1. A month calendar with fixture events.
2. A year/multi-month calendar view.
3. A list/agenda view.
4. A week/time view.
5. Fixture click behaviour.
6. Date click behaviour.
7. Basic custom fixture rendering.

The page should clearly communicate that this is a lab test and not a production feature.

---

## 24. What Not To Build Yet

Do not build these in the first lab pass:

- CMS integration
- Real PlayHQ fixture data
- Save/edit fixture functionality
- Drag and drop rescheduling
- Permissions
- Account-specific routing
- Production reusable component abstraction
- Complex theming system
- Final mobile optimisation

This pass is for proving the calendar display package and UI direction.

---

## 25. Future Production Direction

If FullCalendar works well, the likely production direction is:

```txt
Reusable FixtureCalendarDisplay component
  receives fixture events as props
  supports month/list/year display modes
  supports fixture click callbacks
  supports optional selected date list
```

Potential future API shape:

```tsx
<FixtureCalendarDisplay
  fixtures={fixtures}
  defaultView="month"
  onFixtureClick={handleFixtureClick}
  onDateClick={handleDateClick}
  showViewSwitcher
  showSelectedDateList
/>
```

This should only be created after the lab confirms the best display pattern.

---

## 26. Recommended First Build Order

1. Install FullCalendar packages.
2. Create the lab route.
3. Add hardcoded fixture data.
4. Render a basic `dayGridMonth` calendar.
5. Add other views to the toolbar.
6. Add event click logging.
7. Add fixture detail dialog.
8. Add custom event rendering.
9. Add selected date fixture list.
10. Add notes/comments in the UI about what each variation is testing.

---

## 27. Final Recommendation

Use FullCalendar for the first lab implementation.

Test these variations:

```txt
1. dayGridMonth
2. dayGridMonth with custom fixture pills
3. fixture detail dialog
4. listMonth
5. timeGridWeek
6. multiMonthYear
7. calendar + selected date fixture list
8. possible custom season overview concept
```

The most likely Fixtura production pattern is:

```txt
Month calendar for fixture overview
+
Fixture detail dialog
+
Optional selected date fixture list
+
Separate custom season/year overview if needed
```

Do not over-customise at this stage. The purpose of this lab is to decide whether FullCalendar gives us enough out-of-the-box value for fixture schedule display.

```

A couple of key references behind this: FullCalendar has an official React connector, the month view is `dayGridMonth`, and the multi-month/year view is available through the MultiMonth plugin for a year-style 3x4 month grid. :contentReference[oaicite:0]{index=0}
::contentReference[oaicite:1]{index=1}
```
