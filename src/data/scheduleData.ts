export type SessionType = 'Lecture' | 'Practical' | 'TP' | 'Tutorial' | 'Lab';

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
  cohort: 'I1' | 'I2' | 'I3' | 'I4';
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
    period: "Week 1-8 (From 05/10/2026 for I2-I4, 26/10/2026 for I1)",
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
      id: "I1-G1",
      cohort: "I1",
      name: "I1 - Group 1 (Y1-G1)",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Monday", time: "8h00 - 8h55", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Monday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Monday", time: "16h10 - 17h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "ICT", type: "Lecture", lecturer: "Mr. HENG Rathpisey", room: "Room J-704" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Effective Communication Skills", type: "Lecture", lecturer: "Mr. SIEN Bross", room: "Room J-704" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-402" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-402" },
        { day: "Wednesday", time: "13h00 - 13h55", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-402" },
        { day: "Wednesday", time: "14h00 - 14h55", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-402" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "9h10 - 10h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-601" },
        { day: "Thursday", time: "10h10 - 11h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-601" },
        { day: "Thursday", time: "13h00 - 13h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. NEANG Pheak", room: "Room A-309" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. NEANG Pheak", room: "Room A-309" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. NEANG Pheak", room: "Room A-309" },
        { day: "Friday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. LONG Sovann", room: "Room F-205" },
        { day: "Friday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. LONG Sovann", room: "Room F-205" },
        { day: "Friday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-607" },
        { day: "Friday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-607" },
        { day: "Friday", time: "15h10 - 16h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-607" }
      ]
    },
    {
      id: "I1-G2",
      cohort: "I1",
      name: "I1 - Group 2 (Y1-G2)",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-402" },
        { day: "Monday", time: "10h10 - 11h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-402" },
        { day: "Monday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Monday", time: "16h10 - 17h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "ICT", type: "Lecture", lecturer: "Mr. HENG Rathpisey", room: "Room J-704" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Effective Communication Skills", type: "Lecture", lecturer: "Mr. SIEN Bross", room: "Room J-704" },
        { day: "Tuesday", time: "9h10 - 10h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Tuesday", time: "10h10 - 11h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-312" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-312" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-312" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. HENG Theany", room: "Room A-109" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. HENG Theany", room: "Room A-109" },
        { day: "Wednesday", time: "15h10 - 16h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-603" },
        { day: "Wednesday", time: "16h10 - 17h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-603" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-601" },
        { day: "Thursday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-601" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-601" },
        { day: "Friday", time: "13h00 - 13h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Friday", time: "14h00 - 14h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" }
      ]
    },
    {
      id: "I1-G3",
      cohort: "I1",
      name: "I1 - Group 3 (Y1-G3)",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Monday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Monday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. HOK Tin", room: "Room J-704" },
        { day: "Monday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Monday", time: "16h10 - 17h05", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room J-704" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "ICT", type: "Lecture", lecturer: "Mr. HENG Rathpisey", room: "Room J-704" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Effective Communication Skills", type: "Lecture", lecturer: "Mr. SIEN Bross", room: "Room J-704" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. MOEURN Dear", room: "Room A-401" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. MOEURN Dear", room: "Room A-401" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-417" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-417" },
        { day: "Wednesday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-602" },
        { day: "Wednesday", time: "15h10 - 16h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-602" },
        { day: "Wednesday", time: "16h10 - 17h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. HOK Tin", room: "Room J-602" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room J-704" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. SIEN Bross", room: "Room A-401" },
        { day: "Thursday", time: "15h10 - 16h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-602" },
        { day: "Thursday", time: "16h10 - 17h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-602" },
        { day: "Friday", time: "13h00 - 13h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-401" },
        { day: "Friday", time: "14h00 - 14h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-401" },
        { day: "Friday", time: "15h10 - 16h05", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Mr. PEN Chentra", room: "Room A-401" }
      ]
    },
    {
      id: "I1-G4",
      cohort: "I1",
      name: "I1 - Group 4 (Y1-G4)",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-109" },
        { day: "Monday", time: "8h00 - 8h55", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-109" },
        { day: "Monday", time: "9h10 - 10h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-601" },
        { day: "Monday", time: "10h10 - 11h05", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-601" },
        { day: "Monday", time: "13h00 - 13h55", course: "Mathematics for Engineering I", type: "Tutorial", lecturer: "Mr. CHHEANG Vinha", room: "Room A-420" },
        { day: "Monday", time: "14h00 - 14h55", course: "Mathematics for Engineering I", type: "Tutorial", lecturer: "Mr. CHHEANG Vinha", room: "Room A-420" },
        { day: "Monday", time: "15h10 - 16h05", course: "Mathematics for Engineering I", type: "Tutorial", lecturer: "Mr. CHHEANG Vinha", room: "Room A-420" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "ICT", type: "Lecture", lecturer: "Mr. HENG Rathpisey", room: "Room A-109" },
        { day: "Tuesday", time: "14h00 - 14h55", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. MOEURN Dear", room: "Room A-402" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. MOEURN Dear", room: "Room A-402" },
        { day: "Wednesday", time: "8h00 - 8h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-601" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-601" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-601" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room A-109" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room A-109" },
        { day: "Thursday", time: "15h10 - 16h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-311" },
        { day: "Thursday", time: "16h10 - 17h05", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "Room A-311" },
        { day: "Friday", time: "7h00 - 7h55", course: "Effective Communication Skills", type: "Lecture", lecturer: "Mr. CHAT Koemhong", room: "Room A-109" },
        { day: "Friday", time: "8h00 - 8h55", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. CHAT Koemhong", room: "Room A-109" },
        { day: "Friday", time: "9h10 - 10h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. CHAT Koemhong", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Friday", time: "16h10 - 17h05", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" }
      ]
    },
    {
      id: "I1-G5",
      cohort: "I1",
      name: "I1 - Group 5 (Y1-G5)",
      schedule: [
        { day: "Monday", time: "7h00 - 7h55", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-109" },
        { day: "Monday", time: "8h00 - 8h55", course: "Engineering Mathematics I", type: "Lecture", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-109" },
        { day: "Monday", time: "13h00 - 13h55", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-603" },
        { day: "Monday", time: "14h00 - 14h55", course: "ICT", type: "Lab", lecturer: "Mr. HENG Rathpisey", room: "Room J-603" },
        { day: "Monday", time: "15h10 - 16h05", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Monday", time: "16h10 - 17h05", course: "Physics for Engineers I", type: "Lab", lecturer: "Mr. HENG Theany", room: "Room F-205" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Programming in C++", type: "Lecture", lecturer: "Mr. BOU Channa", room: "Room A-109" },
        { day: "Tuesday", time: "13h00 - 13h55", course: "ICT", type: "Lecture", lecturer: "Mr. HENG Rathpisey", room: "Room A-109" },
        { day: "Tuesday", time: "15h10 - 16h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. CHAT Koemhong", room: "Room A-401" },
        { day: "Tuesday", time: "16h10 - 17h05", course: "Effective Communication Skills", type: "Practical", lecturer: "Mr. CHAT Koemhong", room: "Room A-401" },
        { day: "Wednesday", time: "7h00 - 7h55", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "" },
        { day: "Wednesday", time: "8h00 - 8h55", course: "Physics for Engineers I", type: "Tutorial", lecturer: "Mr. LONG Sovann", room: "" },
        { day: "Wednesday", time: "9h10 - 10h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-420" },
        { day: "Wednesday", time: "10h10 - 11h05", course: "Project and Seminar I", type: "Practical", lecturer: "Mr. TIM Hoksong", room: "Room A-420" },
        { day: "Wednesday", time: "13h00 - 13h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-603" },
        { day: "Wednesday", time: "14h00 - 14h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-603" },
        { day: "Thursday", time: "7h00 - 7h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Thursday", time: "8h00 - 8h55", course: "Programming in C++", type: "Lab", lecturer: "Mr. BOU Channa", room: "Room J-602" },
        { day: "Thursday", time: "9h10 - 10h05", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room A-109" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Physics for Engineers I", type: "Lecture", lecturer: "Mr. LONG Sovann", room: "Room A-109" },
        { day: "Friday", time: "7h00 - 7h55", course: "Effective Communication Skills", type: "Lecture", lecturer: "Mr. CHAT Koemhong", room: "Room A-109" },
        { day: "Friday", time: "8h00 - 8h55", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-401" },
        { day: "Friday", time: "9h10 - 10h05", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-401" },
        { day: "Friday", time: "10h10 - 11h05", course: "Engineering Mathematics I", type: "Tutorial", lecturer: "Dr. PHAUK Sokkhey", room: "Room A-401" }
      ]
    },
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
        { day: "Tuesday", time: "7h00 - 7h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-401" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-401" },
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
        { day: "Thursday", time: "15h10 - 16h05", course: "Programming Design & Implementation", type: "Practical", lecturer: "Mr. BOU Channa", room: "Room J-603" },
        { day: "Friday", time: "13h00 - 13h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "14h00 - 14h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "16h10 - 17h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" }
      ]
    },
    {
      id: "I2-AIECS",
      cohort: "I2",
      name: "I2 - AI Engineering and Cyber Security",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "10h10 - 11h05", course: "Fundamental Concept of Data Security", type: "Lecture", lecturer: "Mr. PICH Reatrey", room: "Room A-109" },
        { day: "Monday", time: "13h00 - 13h55", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Monday", time: "14h00 - 14h55", course: "Fundamental Concept of Data Security", type: "Practical", lecturer: "Mr. PICH Reatrey", room: "Room J-602" },
        { day: "Tuesday", time: "7h00 - 7h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-401" },
        { day: "Tuesday", time: "8h00 - 8h55", course: "Introduction to Software Engineering", type: "Lecture", lecturer: "Mr. TAL Tongsreng", room: "Room A-401" },
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
        { day: "Friday", time: "9h10 - 10h05", course: "Introduction to Software Engineering", type: "TP", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Friday", time: "10h10 - 11h05", course: "Introduction to Software Engineering", type: "TP", lecturer: "Mr. TAL Tongsreng", room: "Room A-109" },
        { day: "Friday", time: "13h00 - 13h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "14h00 - 14h55", course: "Integrating Indigenous Science and STEM", type: "Lecture", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "15h10 - 16h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" },
        { day: "Friday", time: "16h10 - 17h05", course: "Integrating Indigenous Science and STEM", type: "Practical", lecturer: "Dr. MAY Raksmey", room: "Room A-109" }
      ]
    },
    {
      id: "I2-CMIE",
      cohort: "I2",
      name: "I2 - Construction Management and Infrastructure Engineering",
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
        { day: "Thursday", time: "9h10 - 10h05", course: "Engineering Mechanics", type: "Tutorial", lecturer: "Dr. LIM Sovanvichet", room: "Room A-402" },
        { day: "Thursday", time: "10h10 - 11h05", course: "Engineering Mechanics", type: "Tutorial", lecturer: "Dr. LIM Sovanvichet", room: "Room A-402" },
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
      name: "I3 - AI Engineering and Cyber Security",
      schedule: [
        { day: "Monday", time: "9h10 - 10h05", course: "Network", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Monday", time: "10h10 - 11h05", course: "Network", type: "Lecture", lecturer: "Dr. KUY Movsun", room: "Room A-420" },
        { day: "Monday", time: "13h00 - 13h55", course: "Network", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room J-601" },
        { day: "Monday", time: "14h00 - 14h55", course: "Network", type: "Practical", lecturer: "Dr. KUY Movsun", room: "Room J-601" },
        { day: "Monday", time: "15h10 - 16h05", course: "Object-Oriented Programming", type: "Lecture", lecturer: "Mr. HOK TIN", room: "Room A-402" },
        { day: "Monday", time: "16h10 - 17h05", course: "Object-Oriented Programming", type: "Lecture", lecturer: "Mr. HOK TIN", room: "Room A-402" },
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
      name: "I4 - AI Engineering and Cyber Security",
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
  new Set(ALL_SESSIONS.map(s => s.lecturer).filter(Boolean))
).sort((a, b) => a.localeCompare(b));

// All unique Rooms sorted (excluding empty/unassigned rooms)
export const ALL_ROOMS = Array.from(
  new Set(ALL_SESSIONS.map(s => s.room.trim()).filter(Boolean))
).sort((a, b) => a.localeCompare(b));

// Building A rooms exclusively available for class monitor make-up bookings
export const BOOKABLE_ROOMS = ALL_ROOMS.filter(r => r.includes('A-'));

// General study rooms available for student free room view (excludes specialized labs like F-205)
export const FREE_STUDY_ROOMS = ALL_ROOMS.filter(r => !r.includes('F-205') && !r.includes('F-'));

// Parse time slot to [startMinutes, endMinutes]
export function parseSlotMinutes(slot: string): [number, number] {
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

// Get current slot or closest slot given minutes from midnight
export function getCurrentOrClosestSlot(totalMinutes: number): string {
  const slots = SCHEDULE_DATA.meta.timeSlots;
  for (const s of slots) {
    const [start, end] = parseSlotMinutes(s);
    if (totalMinutes >= start && totalMinutes <= end) {
      return s;
    }
  }
  let closestSlot = slots[0];
  let minDiff = Math.abs(totalMinutes - parseSlotMinutes(slots[0])[0]);
  for (let i = 1; i < slots.length; i++) {
    const [start] = parseSlotMinutes(slots[i]);
    const diff = Math.abs(totalMinutes - start);
    if (diff < minDiff) {
      minDiff = diff;
      closestSlot = slots[i];
    }
  }
  return closestSlot;
}

// Match user input string to one of the standard time slots
export function matchSlotFromInput(input: string): string | null {
  if (!input.trim()) return null;
  const clean = input.toLowerCase().trim().replace(/[:\s]/g, '');
  const slots = SCHEDULE_DATA.meta.timeSlots;
  for (const s of slots) {
    const sClean = s.toLowerCase().replace(/[:\s]/g, '');
    if (sClean.includes(clean) || clean.includes(sClean)) {
      return s;
    }
    const [startPart] = s.split('-').map(x => x.trim().toLowerCase().replace(/[:\s]/g, ''));
    if (startPart && (startPart.includes(clean) || clean.includes(startPart))) {
      return s;
    }
  }
  return null;
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
        indicator: 'bg-indigo-500'
      };
    case 'Practical':
    case 'Lab':
      return {
        badge: 'bg-sky-950/80 text-sky-200 border border-sky-800',
        card: 'bg-sky-950/40 hover:bg-sky-950/60 text-sky-100 border border-sky-800/80',
        border: 'border-sky-600',
        indicator: 'bg-sky-500'
      };
    case 'Tutorial':
      return {
        badge: 'bg-amber-950/80 text-amber-200 border border-amber-800',
        card: 'bg-amber-950/40 hover:bg-amber-950/60 text-amber-100 border border-amber-800/80',
        border: 'border-amber-600',
        indicator: 'bg-amber-500'
      };
    case 'TP':
      return {
        badge: 'bg-emerald-950/80 text-emerald-200 border border-emerald-800',
        card: 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 border border-emerald-800/80',
        border: 'border-emerald-600',
        indicator: 'bg-emerald-500'
      };
    default:
      return {
        badge: 'bg-slate-900 text-slate-300 border border-slate-700',
        card: 'bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 border border-slate-800',
        border: 'border-slate-700',
        indicator: 'bg-slate-500'
      };
  }
}

// Filter helper: check whether search query matches session
export function matchesQuery(session: ScheduleSession, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    session.course.toLowerCase().includes(q) ||
    session.lecturer.toLowerCase().includes(q) ||
    session.room.toLowerCase().includes(q) ||
    (session.groupName && session.groupName.toLowerCase().includes(q)) ||
    (session.groupId && session.groupId.toLowerCase().includes(q)) ||
    (session.cohort && session.cohort.toLowerCase().includes(q)) ||
    session.type.toLowerCase().includes(q)
  );
}
