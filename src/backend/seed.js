const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

const beaches = [
    ["Elafonissi", 35.2683, 23.5327, "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Elafonisi_beach.jpg/1280px-Elafonisi_beach.jpg", "Plajă roz cu apă turcoaz, una dintre cele mai frumoase din lume."],
    ["Balos Lagoon", 35.6031, 23.5580, "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Balos_beach.jpg/1280px-Balos_beach.jpg", "Lagună spectaculoasă cu nisip alb și apă cristalină."],
    ["Vai", 35.2606, 26.2583, "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Vai_beach.jpg/1280px-Vai_beach.jpg", "Singura pădure de palmieri naturale din Europa, lângă plajă."],
    ["Falasarna", 35.5244, 23.5642, "https://upload.wikimedia.org/wikipedia/commons/3/3d/Falasarna_beach.jpg", "Plajă lungă și sălbatică pe coasta de vest a Cretei."],
    ["Preveli", 35.1467, 24.5358, "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Preveli_beach.jpg/1280px-Preveli_beach.jpg", "Plajă exotică la gura unui râu, înconjurată de palmieri."],
    ["Matala", 34.9967, 24.7486, "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Matala_Beach.jpg/1280px-Matala_Beach.jpg", "Plajă cu peșteri săpate în stâncă, faimoasă din anii '60."],
    ["Seitan Limania", 35.4231, 25.1425, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Seitan_Limania.jpg/1280px-Seitan_Limania.jpg", "Cala secretă cu apă albastru intens, accesibilă printr-un drum abrupt."],
    ["Almyros Agios Nikolaos", 35.1892, 25.7228, "https://upload.wikimedia.org/wikipedia/commons/1/1a/Almyros_beach_Agios_Nikolaos.jpg", "Plajă lungă cu nisip fin lângă orașul Agios Nikolaos."],
    ["Stavros", 35.5656, 24.0511, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Stavros_beach_Crete.jpg/1280px-Stavros_beach_Crete.jpg", "Plajă celebră din filmul Zorba Grecul, cu apă liniștită."],
    ["Plakias", 35.1964, 24.3986, "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Plakias_beach.jpg/1280px-Plakias_beach.jpg", "Plajă lungă pe coasta de sud, perfectă pentru surf."],
    ["Agia Pelagia", 35.3833, 25.0333, "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Agia_Pelagia_beach.jpg/1280px-Agia_Pelagia_beach.jpg", "Golfuleț protejat cu apă calmă, ideal pentru familii."],
    ["Georgioupolis", 35.3667, 24.2583, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "Plajă lungă de 9 km cu nisip fin și eucalipți."],
    ["Sweetwater", 35.2172, 24.0944, "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", "Plajă izolată accesibilă doar cu barca, cu izvoare naturale."],
    ["Sougia", 35.2025, 23.8669, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "Plajă neaglomerată cu pietriș și apă limpede pe coasta de sud."],
    ["Istron", 35.1833, 25.7333, "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800", "Plajă cu nisip auriu și coline verzi, aproape de Agios Nikolaos."]
];

db.serialize(() => {
    const stmt = db.prepare(
        "INSERT INTO Plaje (nume, latitudine, longitudine, imagine, descriere) VALUES (?, ?, ?, ?, ?)"
    );

    beaches.forEach(b => stmt.run(b));

    stmt.finalize(() => {
        console.log("✅ 15 plaje adăugate cu succes!");
        db.close();
    });
});