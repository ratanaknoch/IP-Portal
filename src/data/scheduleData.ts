export type SessionType = 'Lecture' | 'Practical' | 'TP' | 'Tutorial';

export interface ScheduleSession {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  course: string;
  type: SessionType;
  lecturer: string;
  room: string;
  groupId?: string;
  groupName?: string;
  cohort?: string;
}

export interface GroupSchedule {
  id: string;
  cohort: 'I2' | 'I3' | 'I4';
  name: string;
  schedule: ScheduleSession[];
}

export interface ScheduleMeta {
  institution: string;
  faculty: string;
  academicYear: string;
  semester: string;
  period: string;
  timeSlots: string[];
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
}

export interface ScheduleDataset {
  meta: ScheduleMeta;
  groups: GroupSchedule[];
}

export const SCHEDULE_DATA: ScheduleDataset = {
  meta: {
    institution: "Institute of Technology of Cambodia",
    faculty: "International Engineering School",
    academicYear: "2026 - 2027",
    semester: "Semester 1",
    period: "Week 1-8 (From 05/10/2026)",
    timeSlots: [
      "7h00 - 7h55",
      "8h00 - 8h55",
      "9h10 - 10h05",
      "10h10 - 11h05",
      "13h00 - 13h55",
      "14h00 - 14h55",
      "15h10 - 16h05",
      "16h10 - 17h05"
    ],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  groups: [
    {
      id: "I2-SE",
      cohort: "I2",
      name: "I2 - Software Engineering",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "10h10 - 11h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "13h00 - 13h55", course: "Project and Seminart III", type: "Practical", lecturer: "Dr. SRANG Sarot", room: "Room A-401" },
        { day: "Monday", time: "14h00 - 14h55", course: "Project and Seminart III", type: "Practical", lecturer: "Dr. SRANG Sarot", room: "Room A-401" },
        { day: "Monday", time: "15h10 - 16h05", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Monday", time: "16h10 - 17h05", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Programming Design & Implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Programming Design & Implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Wednesday", time: "7h00 - 7h55", course: "Introduction to Software Engineering", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room J-602" },
        { day: "Wednesday", time: "8h00 - 8h55", course: "Introduction to Software Engineering", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room J-602" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "UI/UX", type: "Lecture", lecturer: "Mr. OL Phearun", room: "Room A-402" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "UI/UX", type: "Lecture", lecturer: "Mr. OL Phearun", room: "Room A-402" },
        { day: "Thursday", time: "9h10 - 10h05", course: "UI/UX", type: "Practical", lecturer: "Mr. OL Phearun", room: "Room J-602" },
        { day: "Thursday", time: "10h10 - 11h05", course: "UI/UX", type: "Practical", lecturer: "Mr. OL Phearun", room: "Room J-602" },
        { day: "Thursday", time: "13h00 - 13h55", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Friday", time: "13h00 - 13h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "14h00 - 14h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "16h10 - 17h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" }
      ]
    },
    {
      id: "I2-AIECS",
      cohort: "I2",
      name: "I2 - AI & Electronic Comm. Systems",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "10h10 - 11h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "13h00 - 13h55", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Monday", time: "14h00 - 14h55", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Programming design & implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Programming design & implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Programming design & implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Programming design & implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Programming design & implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Project and Seminart III", type: "Practical", lecturer: "Dr. SRANG Sarot", room: "Room A-401" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Project and Seminart III", type: "Practical", lecturer: "Dr. SRANG Sarot", room: "Room A-401" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Introduction to Computer Communication and Networks", type: "Lecture", lecturer: "Mr. YOU Vanndy", room: "Room A-401" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Introduction to Computer Communication and Networks", type: "Lecture", lecturer: "Mr. YOU Vanndy", room: "Room A-401" },
        { day: "Thursday", time: "13h00 - 13h55", course: "Introduction to Computer Communication and Networks", type: "Practical", lecturer: "Mr. YOU Vanndy", room: "Room J-602" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Introduction to Computer Communication and Networks", type: "Practical", lecturer: "Mr. YOU Vanndy", room: "Room J-602" },
        { day: "Friday", time: "9h10 - 10h05", course: "Introduction to Software Engineering", type: "TP", lecturer: "Mr. TAL Tongsreng", room: "Lab A-109" },
        { day: "Friday", time: "10h10 - 11h05", course: "Introduction to Software Engineering", type: "TP", lecturer: "Mr. TAL Tongsreng", room: "Lab A-109" },
        { day: "Friday", time: "13h00 - 13h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "14h00 - 14h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "16h10 - 17h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" }
      ]
    },
    {
      id: "I2-CMIE",
      cohort: "I2",
      name: "I2 - Civil & Mech. Int. Eng.",
      schedule: [
        { day: "Monday", time: "14h00 - 14h55", course: "Project and Seminart III", type: "Lecture", lecturer: "Dr. HENG Sounean", room: "Room A-401" },
        { day: "Monday", time: "15h10 - 16h05", course: "Project and Seminart III", type: "Practical", lecturer: "Dr. HENG Sounean", room: "Room A-401" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Programming Design & Implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Programming Design & Implementation", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Engineering Mechanics", type: "Lecture", lecturer: "Dr. LIM Sovanvichet", room: "Room A-401" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Engineering Mechanics", type: "Lecture", lecturer: "Dr. LIM Sovanvichet", room: "Room A-401" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Engineering Mechanics", type: "Tutorial", lecturer: "Dr. LIM Sovanvichet", room: "Room A-401" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Engineering Mechanics", type: "Tutorial", lecturer: "Dr. LIM Sovanvichet", room: "Room A-401" },
        { day: "Thursday", time: "13h00 - 13h55", course: "Electrical Systems", type: "Lecture", lecturer: "Dr. AM Sok Chea", room: "Room A-401" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Electrical Systems", type: "Lecture", lecturer: "Dr. AM Sok Chea", room: "Room A-401" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Electrical Systems", type: "Practical", lecturer: "Dr. AM Sok Chea", room: "Room A-401" },
        { day: "Thursday", time: "16h10 - 17h05", course: "Electrical Systems", type: "Practical", lecturer: "Dr. AM Sok Chea", room: "Room A-401" },
        { day: "Friday", time: "13h00 - 13h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "14h00 - 14h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "16h10 - 17h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" }
      ]
    },
    {
      id: "I3-SE",
      cohort: "I3",
      name: "I3 - Software Engineering",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Internet Programming", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" },
        { day: "Monday", time: "8h00 - 8h55", course: "Internet Programming", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" },
        { day: "Monday", time: "15h10 - 16h05", course: "Networks System Design", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-417" },
        { day: "Monday", time: "16h10 - 17h05", course: "Networks System Design", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-417" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Networks System Design", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Networks System Design", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "IT Project Management", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room J-603" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "IT Project Management", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room J-603" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Software Engineering Concepts", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Tuesday", time: "16h10 - 17h05", course: "Software Engineering Concepts", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Wednesday", time: "7h00 - 7h55", course: "Internet Programming", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room J-602" },
        { day: "Wednesday", time: "8h00 - 8h55", course: "Internet Programming", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room J-602" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Internet Programming", type: "Practical", lecturer: "Mr. CHUN Thavorac", room: "Room J-602" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Internet Programming", type: "Practical", lecturer: "Mr. CHUN Thavorac", room: "Room J-602" },
        { day: "Thursday", time: "7h00 - 7h55", course: "IT Project Management", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Thursday", time: "8h00 - 8h55", course: "IT Project Management", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Software Engineering Concepts", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Software Engineering Concepts", type: "Practical", lecturer: "Mr. TAL Tongsreng", room: "Room A-420" },
        { day: "Friday", time: "7h00 - 7h55", course: "Software System Architecture", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" },
        { day: "Friday", time: "8h00 - 8h55", course: "Software System Architecture", type: "Lecture", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" },
        { day: "Friday", time: "9h10 - 10h05", course: "Software System Architecture", type: "Practical", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" },
        { day: "Friday", time: "10h10 - 11h05", course: "Software System Architecture", type: "Practical", lecturer: "Mr. CHUN Thavorac", room: "Room A-420" }
      ]
    },
    {
      id: "I3-AIECS",
      cohort: "I3",
      name: "I3 - AI & Electronic Comm. Systems",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Network", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Monday", time: "10h10 - 11h05", course: "Network", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Monday", time: "13h00 - 13h55", course: "Network", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room J-601" },
        { day: "Monday", time: "14h00 - 14h55", course: "Network", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room J-601" },
        { day: "Monday", time: "15h10 - 16h05", course: "Object-Oriented Programming", type: "Lecture", lecturer: "Mr. HOK TIN", room: "Room A-420" },
        { day: "Monday", time: "16h10 - 17h05", course: "Object-Oriented Programming", type: "Lecture", lecturer: "Mr. HOK TIN", room: "Room A-420" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Introduction to Cryptography", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-420" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Introduction to Cryptography", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-420" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Operating Systems", type: "Lecture", lecturer: "Mr. YOU Vanndy", room: "Room A-420" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Operating Systems", type: "Lecture", lecturer: "Mr. YOU Vanndy", room: "Room A-420" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Introduction to Cryptography", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-603" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Introduction to Cryptography", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-603" },
        { day: "Wednesday", time: "15h10 - 16h05", course: "Object-Oriented Programming", type: "Practical", lecturer: "Mr. HOK TIN", room: "Room A-420" },
        { day: "Wednesday", time: "16h10 - 17h05", course: "Object-Oriented Programming", type: "Practical", lecturer: "Mr. HOK TIN", room: "Room A-420" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Operating Systems", type: "Practical", lecturer: "Mr. YOU Vanndy", room: "Room J-603" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Operating Systems", type: "Practical", lecturer: "Mr. YOU Vanndy", room: "Room J-603" },
        { day: "Friday", time: "10h10 - 11h05", course: "Capstone Project I", type: "Lecture", lecturer: "Mr. ANG Ousa", room: "Room A-420" },
        { day: "Friday", time: "13h00 - 13h55", course: "Capstone Project I", type: "Practical", lecturer: "Mr. ANG Ousa", room: "Room A-420" },
        { day: "Friday", time: "14h00 - 14h55", course: "Capstone Project I", type: "Practical", lecturer: "Mr. ANG Ousa", room: "Room A-420" }
      ]
    },
    {
      id: "I4-SE",
      cohort: "I4",
      name: "I4 - Software Engineering",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Networks System Administration", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room A-417" },
        { day: "Monday", time: "8h00 - 8h55", course: "Networks System Administration", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room A-417" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Distributed Systems", type: "Lecture", lecturer: "Mr. KHEM Thay", room: "Room A-417" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Distributed Systems", type: "Lecture", lecturer: "Mr. KHEM Thay", room: "Room A-417" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Networks System Administration", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Networks System Administration", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Wednesday", time: "7h00 - 7h55", course: "Data Security and Privacy", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-417" },
        { day: "Wednesday", time: "8h00 - 8h55", course: "Data Security and Privacy", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-417" },
        { day: "Wednesday", time: "15h10 - 16h05", course: "Data Security and Privacy", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-601" },
        { day: "Wednesday", time: "16h10 - 17h05", course: "Data Security and Privacy", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-601" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Game Theory", type: "Lecture", lecturer: "Mr. SOK Kimheng", room: "Room A-420" },
        { day: "Thursday", time: "16h10 - 17h05", course: "Game Theory", type: "Lecture", lecturer: "Mr. SOK Kimheng", room: "Room A-420" },
        { day: "Friday", time: "7h00 - 7h55", course: "Enterprise Resource Planning", type: "Lecture", lecturer: "Ms. Choeun Chakrya", room: "Room A-417" },
        { day: "Friday", time: "8h00 - 8h55", course: "Enterprise Resource Planning", type: "Lecture", lecturer: "Ms. Choeun Chakrya", room: "Room A-417" },
        { day: "Friday", time: "9h10 - 10h05", course: "Enterprise Resource Planning", type: "Practical", lecturer: "Ms. Choeun Chakrya", room: "Room A-417" },
        { day: "Friday", time: "10h10 - 11h05", course: "Enterprise Resource Planning", type: "Practical", lecturer: "Ms. Choeun Chakrya", room: "Room A-417" },
        { day: "Friday", time: "13h00 - 13h55", course: "Distributed Systems", type: "Practical", lecturer: "Mr. KHEM Thay", room: "Room J-601" },
        { day: "Friday", time: "14h00 - 14h55", course: "Distributed Systems", type: "Practical", lecturer: "Mr. KHEM Thay", room: "Room J-601" },
        { day: "Friday", time: "15h10 - 16h05", course: "Game Theory", type: "Practical", lecturer: "Mr. SOK Kimheng", room: "Room J-601" },
        { day: "Friday", time: "16h10 - 17h05", course: "Game Theory", type: "Practical", lecturer: "Mr. SOK Kimheng", room: "Room J-601" }
      ]
    },
    {
      id: "I4-AIECS",
      cohort: "I4",
      name: "I4 - AI & Electronic Comm. Systems",
      schedule: [
        { day: "Tuesday", time: "9h10 - 10h05", course: "Ethical Hacking and Penetration Testing", type: "Lecture", lecturer: "Mr. Roosveltte Taing", room: "Room A-417" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Ethical Hacking and Penetration Testing", type: "Lecture", lecturer: "Mr. Roosveltte Taing", room: "Room A-417" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Machine Learning", type: "Lecture", lecturer: "Mr. PHALLY Rathavann", room: "Room A-417" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Machine Learning", type: "Lecture", lecturer: "Mr. PHALLY Rathavann", room: "Room A-417" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Ethical Hacking and Penetration Testing", type: "Practical", lecturer: "Mr. Roosveltte Taing", room: "Room J-609" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Ethical Hacking and Penetration Testing", type: "Practical", lecturer: "Mr. Roosveltte Taing", room: "Room J-609" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Digital Signal Processing", type: "Lecture", lecturer: "Dr. PEC Rothna", room: "Room A-417" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Digital Signal Processing", type: "Lecture", lecturer: "Dr. PEC Rothna", room: "Room A-417" },
        { day: "Thursday", time: "9h10 - 10h05", course: "System and Network Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-417" },
        { day: "Thursday", time: "10h10 - 11h05", course: "System and Network Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-417" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Capstone Project III", type: "Lecture", lecturer: "Mr. ANG Ousa", room: "Room A-417" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Capstone Project III", type: "Practical", lecturer: "Mr. ANG Ousa", room: "Room A-417" },
        { day: "Thursday", time: "16h10 - 17h05", course: "Capstone Project III", type: "Practical", lecturer: "Mr. ANG Ousa", room: "Room A-417" },
        { day: "Friday", time: "7h00 - 7h55", course: "Digital Signal Processing", type: "Practical", lecturer: "Dr. PEC Rothna", room: "Room J-603" },
        { day: "Friday", time: "8h00 - 8h55", course: "Digital Signal Processing", type: "Practical", lecturer: "Dr. PEC Rothna", room: "Room J-603" },
        { day: "Friday", time: "9h10 - 10h05", course: "System and Network Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-603" },
        { day: "Friday", time: "10h10 - 11h05", course: "System and Network Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-603" },
        { day: "Friday", time: "13h00 - 13h55", course: "Machine Learning", type: "Practical", lecturer: "Mr. PHALLY Rathavann", room: "Room J-603" },
        { day: "Friday", time: "14h00 - 14h55", course: "Machine Learning", type: "Practical", lecturer: "Mr. PHALLY Rathavann", room: "Room J-603" }
      ]
    }
  ]
};

// Flattened master list of all sessions with group references
export const ALL_SESSIONS: ScheduleSession[] = SCHEDULE_DATA.groups.flatMap(g => 
  g.schedule.map(s => ({
    ...s,
    groupId: g.id,
    groupName: g.name,
    cohort: g.cohort
  }))
);

// All unique Lecturers sorted alphabetically
export const ALL_LECTURERS = Array.from(
  new Set(ALL_SESSIONS.map(s => s.lecturer))
).sort((a, b) => a.localeCompare(b));

// All unique Rooms sorted
export const ALL_ROOMS = Array.from(
  new Set(ALL_SESSIONS.map(s => s.room.trim()))
).sort((a, b) => a.localeCompare(b));

// Parse time slot to [startMinutes, endMinutes]
export function parseSlotMinutes(slot: string): [number, number] {
  // Format: "7h00 - 7h55" or "13h00 - 13h55"
  const [startStr, endStr] = slot.split('-').map(s => s.trim());
  const parsePart = (str: string) => {
    const [h, m] = str.split('h').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  return [parsePart(startStr), parsePart(endStr)];
}

// Cambodia UTC+7 current time helper
export function getCambodiaTime(): {
  date: Date;
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeString: string;
  totalMinutes: number;
} {
  const now = new Date();
  // Get time in Asia/Phnom_Penh
  const phnomPenhString = now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' });
  const cambodiaDate = new Date(phnomPenhString);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const dayName = daysOfWeek[cambodiaDate.getDay()];
  const hours = cambodiaDate.getHours();
  const minutes = cambodiaDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  return {
    date: cambodiaDate,
    dayName: dayName as any,
    timeString,
    totalMinutes
  };
}

// Check if a time slot is active right now in Cambodia
export function getSlotLiveStatus(slot: string, targetDay: string, cambodiaInfo: ReturnType<typeof getCambodiaTime>): {
  isCurrent: boolean;
  isUpcoming: boolean;
  isPast: boolean;
} {
  if (cambodiaInfo.dayName !== targetDay) {
    return { isCurrent: false, isUpcoming: false, isPast: false };
  }

  const [start, end] = parseSlotMinutes(slot);
  const now = cambodiaInfo.totalMinutes;

  if (now >= start && now <= end) {
    return { isCurrent: true, isUpcoming: false, isPast: false };
  }
  if (now < start && now >= start - 30) {
    return { isCurrent: false, isUpcoming: true, isPast: false };
  }
  if (now > end) {
    return { isCurrent: false, isUpcoming: false, isPast: true };
  }
  return { isCurrent: false, isUpcoming: false, isPast: false };
}

// Style tokens per session type
export function getSessionTypeStyle(type: SessionType): {
  badge: string;
  card: string;
  border: string;
  indicator: string;
} {
  switch (type) {
    case 'Lecture':
      return {
        badge: 'bg-indigo-950/80 text-indigo-200 border border-indigo-800',
        card: 'bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-100 border border-indigo-800/80',
        border: 'border-indigo-600',
        indicator: 'bg-indigo-400'
      };
    case 'Practical':
    case 'TP':
      return {
        badge: 'bg-emerald-950/80 text-emerald-200 border border-emerald-800',
        card: 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 border border-emerald-800/80',
        border: 'border-emerald-600',
        indicator: 'bg-emerald-400'
      };
    case 'Tutorial':
      return {
        badge: 'bg-amber-950/80 text-amber-200 border border-amber-800',
        card: 'bg-amber-950/40 hover:bg-amber-950/60 text-amber-100 border border-amber-800/80',
        border: 'border-amber-600',
        indicator: 'bg-amber-400'
      };
  }
}

// Find closest or active standard slot from Cambodia time minutes
export function getCurrentOrClosestSlot(cambodiaMinutes: number): string {
  const slots = SCHEDULE_DATA.meta.timeSlots;
  for (const slot of slots) {
    const [start, end] = parseSlotMinutes(slot);
    if (cambodiaMinutes >= start && cambodiaMinutes <= end) {
      return slot;
    }
  }
  // If in between, find the next upcoming slot
  for (const slot of slots) {
    const [start] = parseSlotMinutes(slot);
    if (cambodiaMinutes < start) {
      return slot;
    }
  }
  // If after the day's last class, default to first slot
  return slots[0];
}

// Intelligent parser for user-typed time string (e.g. "9", "9h10", "14:00", "2pm", "10:10")
export function matchSlotFromInput(input: string): string | null {
  const clean = input.trim().toLowerCase();
  if (!clean) return null;

  const slots = SCHEDULE_DATA.meta.timeSlots;

  // Direct exact match
  const exact = slots.find(s => s.toLowerCase() === clean);
  if (exact) return exact;

  // Starts with prefix match, e.g. "7h00", "7h", "13h"
  const prefixMatch = slots.find(s => s.toLowerCase().startsWith(clean));
  if (prefixMatch) return prefixMatch;

  // Numeric hour parser
  let hour: number | null = null;
  let minute: number = 0;

  if (clean.includes('pm')) {
    const num = parseInt(clean.replace('pm', '').trim(), 10);
    if (!isNaN(num)) hour = num < 12 ? num + 12 : num;
  } else if (clean.includes('am')) {
    const num = parseInt(clean.replace('am', '').trim(), 10);
    if (!isNaN(num)) hour = num;
  } else if (clean.includes(':') || clean.includes('h')) {
    const parts = clean.split(/[:h]/);
    hour = parseInt(parts[0], 10);
    if (parts[1]) minute = parseInt(parts[1], 10);
  } else {
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      // If user typed 1, 2, 3, 4, 5, map to afternoon 13, 14, 15, 16, 17
      if (num >= 1 && num <= 5) hour = num + 12;
      else hour = num;
    }
  }

  if (hour !== null && !isNaN(hour)) {
    const targetMin = hour * 60 + minute;
    // Find closest slot
    let closestSlot = slots[0];
    let smallestDelta = Infinity;

    for (const slot of slots) {
      const [start, end] = parseSlotMinutes(slot);
      if (targetMin >= start && targetMin <= end) {
        return slot;
      }
      const delta = Math.abs(start - targetMin);
      if (delta < smallestDelta) {
        smallestDelta = delta;
        closestSlot = slot;
      }
    }
    return closestSlot;
  }

  return null;
}

