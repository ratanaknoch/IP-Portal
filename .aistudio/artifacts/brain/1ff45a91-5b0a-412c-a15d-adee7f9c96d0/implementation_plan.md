# ITC International Engineering School Timetable Portal (Semester 1, 2026–2027)

A minimalist, academic schedule management and viewing system for the Institute of Technology of Cambodia (ITC) International Engineering School, providing live timetable matrices, lecturer consolidated views, lab occupancy diagnostics, and daily agendas across 7 groups in cohorts I2, I3, and I4.

## User Review & Critical Decisions

> [!IMPORTANT]
> The design and operational parameters have been updated per the user instructions:
> - **Class Monitor Passwords**: Strictly accepts `"IPGEN1"`, `"IPGEN2"`, and `"IPGEN3"`.
> - **Make-up Class Room Booking**: Interactive booking form for authorized monitors to reserve rooms (Building A confirmed, Building J shared) with class name, room, generation, and group details. Booked sessions immediately reflect across the timetable matrix, room occupancy, and daily agendas.
> - **Room Status & Coloring**: Switched colors: Building A classrooms are colored **green** (`Confirmed Available by IP`), while Building J computer labs are colored **grey/neutral** (`Shared Lab - Availability Unconfirmed by IP`) since the IP program does not have full control over Building J.
> - **Clean Front-Page Pathways**: Removed wordy descriptions; cards now have clean, prominent titles with concise badges (`MONITOR ONLY`, `UNDER DEV`).
> - **Student Portal (Under Dev)**: Marked as `UNDER DEV`. When clicked, it asks students to select their class so they only see their personal schedule (no other cohorts/groups mixed in), with an easy "Change Class" option if needed.
> - **Student Portal Navigation**: Features only **Timetable Matrix**, **Today's Agenda**, and **Clubs** (which opens the Club page marked Under Dev).
> - **Icon Refinement**: Removed the AI sparkle/star icon from Find Free Rooms and replaced it with clean architectural campus icons (`Building2`/`DoorOpen`).

---

## 1. Overview & Core Features

1. **Front Page Landing**
   - Three concise cards: **Class Monitor Portal** (`MONITOR ONLY`), **Student Club** (`UNDER DEV`), and **Student Portal** (`UNDER DEV`).
   - Clean shortcuts for **Find Free Study Room** and **ITC Official Moodle LMS**.

2. **Class Monitor Portal & Make-up Reservations**
   - Password guarded with `IPGEN1`, `IPGEN2`, or `IPGEN3`.
   - Complete multi-cohort matrix, lecturer consolidated view, and room occupancy tracker.
   - Room reservation form for make-up lectures and lab sessions.

3. **Student Portal**
   - Prompts for student class selection on first click.
   - Shows exclusively their class schedule (e.g. `I2-SE`, `I3-AIECS`) without clutter from other generations.
   - Includes navigation tabs: **Timetable Matrix**, **Today's Agenda**, and **Clubs**.
   - One-click class switcher in case of misclick.

4. **Room Occupancy & Free Study Room Finder**
   - Building A rooms: Confirmed Available (Green).
   - Building J labs: Unconfirmed Shared (Grey/Neutral).
