const rawDamageCalculation = (attack, sharpnessValue, hitzone, weapon) => {
    let weaponVariable = 1;
    let weaponSpecialVariable = 1;
    let weaponClass = 1;
    switch (weapon) {
        case "GS":
            weaponVariable = 1;
            weaponClass = 4.8;
            weaponSpecialVariable = 1.05;
            break;
        case "SnS":
            weaponVariable = 1.5;
            weaponClass = 1.4;
            break;
        case "DB":
            weaponVariable = 1;
            weaponClass = 1.4;
            break;
        case "Hammer":
            weaponVariable = 1;
            weaponClass = 5.2;
            break;
        case "Lance":
            weaponVariable = 1;
            weaponClass = 2.3;
            weaponSpecialVariable = 0.925;
            break;
    }

    // Fonction pour calculer les combos en fonction du type d'input (triangle, circle, triangle_circle, roll, etc.)
    const calculateCombo = (inputType) => {
        let comboDetails = '';
        let comboTotal = 0;
        let motionValues = weaponData[weaponType].motionValues.filter(item => item.input === inputType);

        // Calculer les valeurs pour chaque motion_value correspondant à l'input
        motionValues.forEach(item => {
            let rawFormula = attack * item.motion_value * sharpnessValue * (hitzone / 100) * weaponVariable / weaponClass;
            rawFormula = Math.round(rawFormula * 100) / 100;
            comboDetails += rawFormula + '|';
        });

        // Retirer le dernier "|"
        comboDetails = comboDetails.slice(0, -1);
        comboDetails = comboDetails.split('|');

        // Additionner les motion_values
        comboTotal = comboDetails.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        comboTotal = Math.round(comboTotal * 100) / 100;

        return { comboDetails, comboTotal };
    };

    // Calcul des différents combos
    let triCombo = calculateCombo("triangle");
    let cirCombo = calculateCombo("circle");
    let tricirCombo = calculateCombo("triangle_circle");  // Nouvel input "triangle_circle"
    let rollCombo = calculateCombo("roll");
    let guardCombo = calculateCombo("guard");
    let unsheatheCombo = calculateCombo("unsheathe");

    return { triCombo, cirCombo, tricirCombo, rollCombo, guardCombo, unsheatheCombo };
}

const elemDamageCalculation = (elemValue, elemSharpness, hitzone) => {
    let elemFormula = elemValue * elemSharpness * (hitzone / 100) / 10;
    return Math.round(elemFormula * 100) / 100;
};

function getHitzonesByDamageType(monster, damageType) {
    // Si damageType est 'raw', on le mappe selon le weaponType
    if (damageType === 'raw') {
        switch (weaponType) {
            case "GS":
            case "SnS":
            case "DB":
                damageType = 'cut';  // Par exemple, ces armes utilisent 'cut'
                break;
            case "Hammer":
                damageType = 'blow';  // Hammer utilise 'blow'
                break;
            case "Lance":
                damageType = 'WTF';  // Lance a un type de dommage spécial ou non pris en charge
                break;
            default:
                damageType = 'unknown'; // Cas non pris en charge
                break;
        }
    }

    const result = {};

    // Parcourt chaque zone de frappe dans Hitzones
    for (const zone in monster.Hitzones) {
        // Vérifie si le damageType existe pour cette zone
        if (monster.Hitzones[zone][damageType] !== undefined) {
            result[zone] = monster.Hitzones[zone][damageType];
        } else {
            result[zone] = `Le type de dommage "${damageType}" n'est pas défini pour la zone "${zone}".`;
        }
    }

    return result;
}

function processHitzones(monster, damageType) {
    const hitzones = getHitzonesByDamageType(monster, damageType);

    // Utilisation d'un Map pour garantir l'ordre
    const sortedHitzones = new Map();

    hitzonesOrder.forEach(zone => {
        if (hitzones.hasOwnProperty(zone)) {
            sortedHitzones.set(zone, hitzones[zone]);
        }
    });

    return sortedHitzones;
}

function applyDamageCalculation(monster, damageType, attack, sharpnessValue) {
    const sortedHitzones = processHitzones(monster, damageType);
    console.log('elem2', sortedHitzones); // Debugging
    const damageResults = {}; // Stocke les résultats

    if (damageType === 'raw') {
        sortedHitzones.forEach((hitzone, zone) => {
            damageResults[zone] = rawDamageCalculation(attack, sharpnessValue, hitzone, weaponType);
        });
    } else {
        sortedHitzones.forEach((hitzone, zone) => {
            damageResults[zone] = elemDamageCalculation(attack, sharpnessValue, hitzone);
        });
    }

    return damageResults;
}

function generateDamageTable(damageResults) {
    // Sélectionne la valeur du select avec id="monster"
    const monsterSelect = document.getElementById("monster");
    const selectedMonster = monsterSelect ? monsterSelect.value : "Unknown Monster";
    const weaponName = document.getElementById('weapon').value

    // Création de la div pour afficher le monstre sélectionné
    const monsterDiv = document.createElement("div");
    monsterDiv.id = "monster-name";
    monsterDiv.textContent = `${selectedMonster} - ${weaponName}`;
    monsterDiv.style.fontWeight = "bold";
    monsterDiv.style.marginBottom = "10px";

    // Création du tableau
    const table = document.createElement("table");
    table.id = "monster_damage_values";
    table.className = "table table-hover table-bordered";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Première colonne pour les noms des zones
    const thZone = document.createElement("th");
    thZone.textContent = "#";
    headerRow.appendChild(thZone);

    // Déterminer dynamiquement les types de combos et retirer "Combo" du nom
    const firstZone = Object.keys(damageResults)[0];
    const comboTypes = Object.keys(damageResults[firstZone]).map(combo => combo.replace("Combo", ""));

    // Ajouter une colonne pour chaque type de coup
    comboTypes.forEach(combo => {
        const th = document.createElement("th");
        th.textContent = combo; // Nom propre sans "Combo"
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corps du tableau (tbody)
    const tbody = document.createElement("tbody");

    Object.entries(damageResults).forEach(([zone, combos]) => {
        const row = document.createElement("tr");

        // Ajouter la zone dans la première colonne
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = zone;
        row.appendChild(th);

        // Ajouter les valeurs pour chaque type de coup
        Object.keys(combos).forEach(comboKey => {
            const td = document.createElement("td");

            let comboDetails = combos[comboKey].comboDetails || [];
            let comboTotal = combos[comboKey].comboTotal || 0;

            // Affichage conditionnel
            let comboText = comboDetails.length > 1
                ? `${comboDetails.join(" + ")} = ${comboTotal}`
                : comboTotal.toString();

            td.textContent = comboText;
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Ajoute la div et le tableau au body
    const mainContainer = document.getElementById("generated_tables");

    const container = document.createElement("div");
    container.setAttribute('ref', selectedMonster);
    container.className = "col-12 col-lg-6";
    container.appendChild(monsterDiv);
    container.appendChild(table);

    mainContainer.appendChild(container);
}