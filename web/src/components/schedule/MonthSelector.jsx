import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";

const months = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function MonthSelector({ selectedMonth, onMonthChange }) {
  const handleChange = (_, newMonth) => {
    if (newMonth !== null) {
      onMonthChange(newMonth);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Selecciona un mes:
      </Typography>
      <ToggleButtonGroup
        value={selectedMonth}
        exclusive
        onChange={handleChange}
        aria-label="selector de mes"
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {months.map((monthName, index) => (
          <ToggleButton key={index} value={index} aria-label={monthName}>
            {monthName}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}