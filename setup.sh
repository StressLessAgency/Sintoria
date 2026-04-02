#!/usr/bin/env bash
set -e
npm install framer-motion@^11 class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-slot @shadergradient/react @react-spring/three three
npm install -D @types/three tailwindcss@^3 autoprefixer postcss typescript @types/node @types/react @types/react-dom
mkdir -p app components/ui components/sections hooks lib public
echo "✓ Dependencies installed and directories ready"
