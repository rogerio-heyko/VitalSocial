/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                brand: {
                    teal: '#00A09A',
                    green: '#8BC441',
                    yellow: '#C9D193',
                    orange: '#EF5825',
                    red: '#EE282F',
                }
            }
        },
    },
    plugins: [],
}
