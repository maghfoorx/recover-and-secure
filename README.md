# Lost Property and Amaanat (Left Luggage)

## Overview
An offline desktop application made using Electron, React, TypeScript and Vite. All of the data is stored in the database.db file in the root of the directory. sqlite3 is used to modify the database.

The application has two main sections, Left Luggage and Lost Property:
- Lost property section allows user to report any items they have lost so when the department finds the item, the person can be contacted. You are also able to add found items so you have a registry of all the items that are found and people can come and query for those items.
- Left luggage section allows users to sign up and hand in any items they want to store in the department. Whenever a user hands in an item, the item is registered and a receipt can be printed from the printer.

There is also a dashboard area which lists the numbers of items, users and all relevant information in one place.
The application also has the ability to name itself from some options. This is so you are able to use this application on multiple devices at the same place. The receipt printed will have the device name on it so you know which computer the information is stored for the user.

## Developer Commands

- `yarn dev` to enter development.
- `yarn build` to build and package the application.

### Credits

Thank you to the developers that created the electron-vite-react template. I would not be able to get started with this project without their tempalte and documentation. You can find the repo [here](https://github.com/electron-vite/electron-vite-react).

