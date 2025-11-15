# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm run dev
```
- Starts Vite development server
- Default URL: http://localhost:5173
- Hot Module Replacement (HMR) enabled
- Fast refresh for React components

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output directory: `dist/`
- Minified and bundled code
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Test production build before deployment
- Runs on local server

### Install Dependencies
```bash
npm install
```
- Installs all dependencies from package.json
- Creates/updates package-lock.json

## Git Commands (Common)
```bash
git status              # Check working tree status
git add .              # Stage all changes
git commit -m "..."    # Commit changes
git push               # Push to remote
git pull               # Pull from remote
git branch             # List branches
git checkout -b <name> # Create new branch
```

## Testing Commands
**Note**: No testing framework currently configured
- Planned for v3.0: Unit tests and E2E tests with Playwright

## Linting/Formatting Commands
**Note**: No linter/formatter currently configured
- No ESLint configuration found
- No Prettier configuration found
- Consider adding in future for code consistency

## macOS/Darwin System Commands
```bash
ls                     # List directory contents
ls -la                # List all with details
cd <directory>        # Change directory
pwd                   # Print working directory
mkdir <name>          # Create directory
rm <file>             # Remove file
rm -rf <directory>    # Remove directory recursively
cp <src> <dest>       # Copy file
mv <src> <dest>       # Move/rename file
cat <file>            # Display file contents
grep <pattern> <file> # Search in file
find . -name <pattern># Find files by name
```

## Useful Development Workflows

### Fresh Start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Quick Deploy
```bash
npm run build
# Then deploy dist/ folder to hosting service
```

## Port Management
If port 5173 is already in use:
```bash
lsof -ti:5173 | xargs kill  # Kill process on port 5173 (macOS)
```
Or Vite will automatically use next available port
