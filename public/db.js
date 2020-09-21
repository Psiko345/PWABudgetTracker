let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = event => {
    const db = event.target.result;

    const budgetStore = db.createObjectStore("pending", { autoIncrement: true })
};

request.onerror = function (event) {
    console.log("You dun goofed. Error code:" + event.target.errorCode);
};