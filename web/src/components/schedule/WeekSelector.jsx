import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
dayjs.extend(isoWeek);

export default function WeekSelector({ year, month, selectedWeekStart, setSelectedWeekStart }) {
  const weeks = [];

  let startOfFirstWeek = dayjs().year(year).month(month).startOf("month").startOf("isoWeek");
  const endOfMonth = dayjs().year(year).month(month).endOf("month").endOf("isoWeek");

  let currentWeekStart = startOfFirstWeek;

  while (currentWeekStart.isBefore(endOfMonth)) {
    const weekEnd = currentWeekStart.endOf("isoWeek");
    weeks.push({
      start: currentWeekStart,
      end: weekEnd,
    });
    currentWeekStart = currentWeekStart.add(1, "week");
  }

  const handleWeekChange = (event, newWeekStart) => {
    if (newWeekStart !== null) {
      setSelectedWeekStart(dayjs(newWeekStart));
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Selecciona una semana:
      </Typography>
      <ToggleButtonGroup
        value={selectedWeekStart.format("YYYY-MM-DD")}
        exclusive
        onChange={handleWeekChange}
        aria-label="selector de semana"
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {weeks.map(({ start, end }) => {
          const label = `${start.format("DD/MM")} - ${end.format("DD/MM")}`;
          return (
            <ToggleButton key={start.format("YYYY-MM-DD")} value={start.format("YYYY-MM-DD")}>
              {label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}