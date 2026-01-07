FROM node:20-bullseye
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    ghostscript \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential

# יצירת תיקיית עבודה
WORKDIR /usr/src/app

# העתקת קבצי ההגדרות
COPY package*.json ./

# התקנת ספריות Node
RUN npm install

# העתקת שאר הקוד
COPY . .

# חשיפת הפורט
EXPOSE 8080

# הפעלת השרת
CMD [ "npm", "start" ]