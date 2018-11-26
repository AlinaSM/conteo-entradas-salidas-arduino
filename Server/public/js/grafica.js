var ctx = document.getElementById("miGrafica").getContext('2d');

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange", "Prueba"],
        datasets: [{
            label: 'Frecuencia',
            data: [12, 19, 3, 5, 2, 3, 2],
            backgroundColor: 'rgb(71, 71, 193, 0.3)',
            borderColor: 'rgb(31, 31, 84, 0.25)',
            borderWidth: 3
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});