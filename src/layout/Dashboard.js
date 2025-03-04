import { Container, Grid2 } from "@mui/material";

export default function Dashboard() {
	return (
		<Container maxWidth="xl" className="mt-3">
			<Grid2 container spacing={2}>
				<Grid2 size={{ lg: 3, md: 6, sm: 12 }} order={{ sm: 1 }}></Grid2>
				<Grid2 size={{ lg: 6, md: 12, sm: 12 }} order={{ lg: 2, sm: 3 }}></Grid2>
				<Grid2 size={{ lg: 3, md: 6, sm: 12 }} order={{ lg: 3, sm: 2 }}></Grid2>
			</Grid2>
		</Container>
	);
}
