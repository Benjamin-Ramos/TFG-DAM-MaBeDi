import { useEffect, useState } from "react";
import { Stack } from "@mui/material"
import dayjs from "dayjs";
import axios from "axios";
import YearSelector from "./YearSelector";
import MonthSelector from "./MonthSelector";
import WeekSelector from "./WeekSelector";
import ScheduleViewer from "./ScheduleViewer";

export default function ScheduleTable() {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    dayjs().startOf("week")
  );
  const [schedule, setSchedule] = useState([]);

  const token = localStorage.getItem("token");
  const doctorId = localStorage.getItem("doctorId");
  const config = { headers: { Authorization: `Bearer ${token}` } };

useEffect(() => {
  const fetchSchedule = async () => {
    try {
      const date = selectedWeekStart.format("YYYY-MM-DD");
      console.log("Enviando startDate a API:", date);
      const res = await axios.get(
        `https://tfg-dam-mabedi.onrender.com/Doctor/doctor/${doctorId}/weekly-schedule?startDate=${date}`,
        config
      );

      const cleaned = res.data.$values.map((day) => ({
        ...day,
        appointments: day.appointments?.$values || [],
      }));

      setSchedule(cleaned);
    } catch (err) {
      console.error("Error al obtener horario:", err);
    }
  };

  fetchSchedule();
}, [selectedWeekStart]);

  return (
    <>
      <Stack direction="row" spacing={10} alignItems="center" sx={{ mb: 2 }}>
        <YearSelector year={selectedYear} setYear={setSelectedYear} />
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </Stack>
      <WeekSelector
        year={selectedYear}
        month={selectedMonth}
        selectedWeekStart={selectedWeekStart}
        setSelectedWeekStart={setSelectedWeekStart}
      />
      <ScheduleViewer schedules={schedule} />
    </>
  );
}