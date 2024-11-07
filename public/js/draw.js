document.addEventListener('DOMContentLoaded', () => {
    const dataFiles = {
        'TT-1': {
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [10, 20, 30]
        },
        'TT-2': {
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [15, 25, 35]
        },
        'TT-3': {
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [5, 15, 25]
        },
        'TT-4': {
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [20, 10, 30]
        },
        'Test Executionlist': { 
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [15, 25, 35]
        },
        'Screenshot test': {
            "labels": ["월", "화", "수", "목", "금", "토", "일"],
            "values": [15, 25, 35]
        }
    };

    const NUMBER_CFG = { count: 7, min: -100, max: 100 };
    
    const Utils = {
        numbers: function (config) {
            const { min, max, count } = config;
            const numbers = [];
            for (let i = 0; i < count; i++) {
                let temp = Math.floor(Math.random() * (max - min + 1)) + min;
                if (temp < 0) temp = -temp;
                numbers.push(temp);
            }
            return numbers;
        },
        CHART_COLORS: {
            red: 'rgba(255, 99, 132, 0.5)',
            blue: 'rgba(54, 162, 235, 0.5)',
            green: 'rgba(75, 192, 192, 0.5)',
            yellow: 'rgba(255, 206, 86, 0.5)',
        }
    };

    function getData(title) {
        return new Promise((res) => {
            const data = {
                labels: dataFiles[title].labels,
                datasets: [
                    {
                        label: 'Failed',
                        data: Utils.numbers(NUMBER_CFG),
                        backgroundColor: Utils.CHART_COLORS.red,
                    },
                    {
                        label: 'Error',
                        data: Utils.numbers(NUMBER_CFG),
                        backgroundColor: Utils.CHART_COLORS.yellow,
                    },
                    {
                        label: 'Passed',
                        data: Utils.numbers(NUMBER_CFG),
                        backgroundColor: Utils.CHART_COLORS.green,
                    },
                ]
            };
            res(data);
        });
    }

    async function loadDataAndCreateCharts() {
        const faqs = document.querySelectorAll('.faq');
        
        for (const faq of faqs) {
            const title = faq.querySelector('.faq__title').innerText; // ID와 일치하도록 변환
            const canvasId = `chart-${title.replace(/\s+/g, '-')}`; // ID 생성
            const canvas = faq.querySelector(`#${canvasId}`); // 해당 canvas 선택

            // 데이터가 존재하는지 확인
            if (dataFiles[title]) {
                // Chart.js로 Stacked Bar Chart 생성
                const chartData = await getData(title); // 제목을 통해 데이터 가져오기
                new Chart(canvas, {
                    type: 'bar', // 그래프 종류
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        scales: {
                            x: {
                                stacked: true, // x축 스택 설정
                                ticks: {
                                    font: {
                                        size: 10 // x축 글자 크기 조정
                                    }
                                }
                            },
                            y: {
                                stacked: true, // y축 스택 설정
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        size: 10 // y축 글자 크기 조정
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                console.error(`No data found for title: ${title}`);
            }
        }
    }

    loadDataAndCreateCharts(); // 차트 로드 함수 호출
});
