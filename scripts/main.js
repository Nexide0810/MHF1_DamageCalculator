var weaponType = ""
var weaponData = {}
const hitzonesOrder = ['Face', 'Head', 'Horn', 'Neck', 'Back', 'Shoulder', 'Spine', 'Wing', 'Chest', 'Body', 'Stomach', 'Stomach (broken)', 'Tail', 'Foot'];
document.getElementById('weapon_type').addEventListener('change', async () => {
    let weaponSelect = document.getElementById('weapon_type')
    weaponType = weaponSelect.value; // Récupère la valeur sélectionnée

    if (weaponType === "GS" || weaponType === "DB" || weaponType === "Hammer" || weaponType === "Lance") {
        alert('Ce type d\'arme n\'est pas encore pris en charge.');
        weaponSelect.value = "none";
        return;
    }
    const input = document.getElementById('weapon');
    const dataList = document.getElementById('suggestions');

    // Inputs pour afficher les détails de l'arme
    const attackPowerInput = document.getElementById('attack_power');
    const sharpnessSelect = document.getElementById('sharpness');
    const elementTypeSelect = document.getElementById('element_type');
    const elementValueInput = document.getElementById('element_value');

    let weaponsList = {}; // Stocke les armes sous forme d'objet

    try {
        let weaponTypeLowerCase = weaponType.toLowerCase(); // Met en minuscule le type d'arme
        // const response = await fetch(`../json/${weaponTypeLowerCase}.json`); // Vérifie le chemin
        const response = await fetch(`https://nexide0810.github.io/MHF1_DamageCalculator/json/${weaponTypeLowerCase}.json`);
        weaponData = await response.json();
        weaponsList = weaponData.SnS.weapons; // Stocke toutes les armes sous forme d'objet
    } catch (error) {
        console.error('Erreur lors du chargement du JSON:', error);
    }

    input.addEventListener('input', () => {
        const value = input.value.toLowerCase(); // Met en minuscule l'entrée de l'utilisateur
        dataList.innerHTML = ''; // Réinitialise la liste de suggestions

        if (value) {
            const matches = Object.values(weaponsList).filter(weapon =>
                weapon.name.toLowerCase().startsWith(value) // Ignore les majuscules/minuscules
            );

            matches.forEach(match => {
                const option = document.createElement('option');
                option.value = match.name;
                dataList.appendChild(option);
            });
        }
    });

    // Cette fonction est appelée lors de la modification de l'input ou lors de l'appui sur Enter
    const updateWeaponDetails = () => {
        const selectedWeapon = Object.values(weaponsList).find(weapon =>
            weapon.name.toLowerCase() === input.value.toLowerCase() // Ignore les majuscules/minuscules
        );

        if (selectedWeapon) {
            attackPowerInput.value = selectedWeapon.attack;
            sharpnessSelect.value = selectedWeapon.sharpness || "red";
            elementTypeSelect.value = selectedWeapon.element.type || "none";
            elementValueInput.value = selectedWeapon.element.value || "0";
        }
    };

    // Lorsque l'utilisateur quitte le champ (perte de focus)
    input.addEventListener('blur', () => {
        updateWeaponDetails();
    });

    // Lorsque l'utilisateur appuie sur Enter
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            updateWeaponDetails();
        }
    });

    // Remplissage automatique des champs après sélection
    input.addEventListener('change', () => {
        updateWeaponDetails();

        // Ferme la datalist
        setTimeout(() => input.blur(), 100);
    });
});

document.getElementById('generation').addEventListener('click', async () => { // Utilisation d'async ici
    let monster = {};
    let monsterSelected = document.getElementById('monster').value; // Récupère la valeur sélectionnée
    try {
        // const response = await fetch('../json/monsters.json'); // Attendre la réponse
        const response = await fetch('https://nexide0810.github.io/MHF1_DamageCalculator/json/monsters.json'); // Vérifie le chemin
        const data = await response.json(); // Attendre la conversion du JSON
        monster = data[monsterSelected]; // Stocke tous les monstres sous forme d'objet
    } catch (error) {
        console.error('Erreur lors du chargement du JSON:', error);
    }

    const attackPower = document.getElementById('attack_power').value;
    const sharpness = document.getElementById('sharpness').value;
    const elementType = document.getElementById('element_type').value;
    const elementValue = document.getElementById('element_value').value;

    let raw_damage = 0;
    let element_damage = 0;
    let total_damage = 0;
    let sharpness_multiplier = 1;
    let element_sharpness_multiplier = 1;
    switch (sharpness) {
        case "red":
            sharpness_multiplier = 0.5;
            element_sharpness_multiplier = 0.25;
            break;
        case "orange":
            sharpness_multiplier = 0.75;
            element_sharpness_multiplier = 0.5;
            break;
        case "yellow":
            sharpness_multiplier = 1;
            element_sharpness_multiplier = 0.75;
            break;
        case "green":
            sharpness_multiplier = 1.125;
            element_sharpness_multiplier = 1;
            break;
        case "blue":
            sharpness_multiplier = 1.25;
            element_sharpness_multiplier = 1.0625;
            break;
        case "white":
            sharpness_multiplier = 1.3;
            element_sharpness_multiplier = 1.125;
            break;
        default:
            console.log(`Pas de tranchant ${expr}.`);
    }

    
    const results = applyDamageCalculation(monster, 'raw', attackPower, sharpness_multiplier)
    let resultsElem
    if (elementType !== "none") {
        resultsElem = applyDamageCalculation(monster, elementType, elementValue, element_sharpness_multiplier)
    }
    console.log(resultsElem)
    generateDamageTable(results, resultsElem, elementType);

});

document.getElementById('clear_monster').addEventListener('click', () => {
    const container = document.getElementById('generated_tables');
    container.innerHTML = ''; // Vide le conteneur
});


