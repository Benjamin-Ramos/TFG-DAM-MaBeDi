import { MenuItem, Select, Typography, Box } from "@mui/material";

export default function YearSelector({ year, setYear }) {
  const years = [2023, 2024, 2025];

  return (
    <Box sx={{ mb: 2 }}>
      <Typography>Selecciona un año:</Typography>
      <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}