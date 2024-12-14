const { execSync } = require("child_process");

// Ensure we have database configuration
if (!process.env.DATABASE_URL) {
	console.error(
		"\nError: DATABASE_URL is not set\n" +
			"\nPlease follow these steps:\n" +
			"1. Create a new Supabase project for testing\n" +
			"2. Get the connection string from Project Settings -> Database\n" +
			"3. Add to .env.test:\n" +
			"   DATABASE_URL=your_test_connection_string\n" +
			"   DIRECT_URL=your_test_direct_connection_string\n"
	);
	process.exit(1);
}

// Set up test database
function setupTestDb() {
	try {
		// Reset and set up the database schema
		execSync("npx prisma db push --force-reset", {
			env: {
				...process.env,
			},
			stdio: "inherit", // This will show the Prisma output
		});

		console.log("Test database reset successfully");
	} catch (error) {
		console.error("Error setting up test database:", error);
		process.exit(1);
	}
}

// No cleanup needed as we're using --force-reset
function cleanupTestDb() {
	console.log("Test database cleanup not needed (using --force-reset)");
}

// Handle command line arguments
const command = process.argv[2];
if (command === "setup") {
	setupTestDb();
} else if (command === "cleanup") {
	cleanupTestDb();
} else {
	console.error("Please specify either 'setup' or 'cleanup'");
	process.exit(1);
}
