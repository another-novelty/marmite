import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            // colors: {
            //     'saffron': {
            //         50: '#fef9ee',
            //         100: '#fdf1d7',
            //         200: '#fbe0ad',
            //         300: '#f6bd60',
            //         400: '#f3a644',
            //         500: '#f08c1f',
            //         600: '#e17115',
            //         700: '#bb5613',
            //         800: '#944518',
            //         900: '#783a16',
            //         950: '#411b09',
            //     },
            // },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
        // colors: {
        //     transparent: 'transparent',
        //     current: 'currentColor',
        //     black: '#090b0b',
        //     'white': '#F4F6F6',
        //     'gray': colors.amber,

        //     'saffron': {
        //         50: '#fef9ee',
        //         100: '#fdf1d7',
        //         200: '#fbe0ad',
        //         300: '#f6bd60',
        //         400: '#f3a644',
        //         500: '#f08c1f',
        //         600: '#e17115',
        //         700: '#bb5613',
        //         800: '#944518',
        //         900: '#783a16',
        //         950: '#411b09',
        //     },
        // },
    },

    plugins: [forms],
};
