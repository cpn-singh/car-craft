# Aurel Motor Atelier

A small React website for a fictional luxury car dealership. The project is a frontend prototype: its vehicle cards use example information and the contact links open an email draft.

## Run the website

1. Open a terminal in this project folder.
2. Run `npm install` to install React and Vite.
3. Run `npm run dev` to start the local development server.
4. Open the address printed in the terminal (usually `http://localhost:5173`).

To make a production build, run `npm run build`. Vite writes the finished site to the `dist` folder.

## Where to find things

- `index.html` is the small page shell Vite loads first.
- `src/main.jsx` starts React and imports the shared styles.
- `src/App.jsx` puts the page sections together and controls the video dialog and page effects.
- `src/components/` contains one JSX file for each part of the page.
- `src/data/cars.js` contains the example vehicle information. Edit this file to change the cars.
- `src/style.css` contains the colors, layout, responsive styles, and motion effects.

## Beginner notes

A React component is a JavaScript function that returns the HTML-like JSX for one part of the page. For example, `Hero.jsx` describes the large opening section. `App.jsx` imports the components and places them in order.

The vehicle cards are generated from the array in `cars.js`. Each object in the array describes one car, and `Collection.jsx` loops through those objects to create a card. The filter buttons update a small piece of React state, which tells the collection which cards to show.

The website uses remote Unsplash images and a Pexels video, so those visuals need an internet connection.
