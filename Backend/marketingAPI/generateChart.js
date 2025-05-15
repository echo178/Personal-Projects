import Chart from 'chart.js'
import annotation from 'chartjs-plugin-annotation'
import moment from 'moment'
import {createCanvas} from 'canvas'

export default function generateChartDataURL(dataObj,timeframe){
    function roundUp(value){
      let digitCount = Math.floor(Math.log10(value))
      let divisor = Math.pow(10,digitCount)/2
      return Math.ceil(value/divisor)*divisor
    }
    function generateDataObj(dataObj,timeFrame){
      
      if(timeFrame === 12){
        let label = Object.keys(dataObj.prev_tweetCount_total)
        label= [...label, ...Object.keys(dataObj.curr_tweetCount_total)]
        label = label.map((string) => moment(string.split(' ')[1],'HH').format('HH:mm'))
        
        let data = Object.values(dataObj.prev_tweetCount_total)
        data = [...data,...Object.values(dataObj.prev_tweetCount_total)]
      
        return {
          labels: label,
          datasets: [{
            label: 'previous 24 hours',
            data: data,
            borderColor: '#36A2EB',
            backgroundColor: '#36A2EB',
            borderWidth: 3
          }],   
        }
      }
      else if(timeFrame === 24){
        
        let label = Object.keys(dataObj.prev_tweetCount_total).map((string) => moment(string.split(' ')[1],'HH').format('HH:mm'))
        let data1 = Object.values(dataObj.prev_tweetCount_total)
        let data2 = Object.values(dataObj.curr_tweetCount_total)
    
        return{
          labels: label,
          datasets: [
            {
            label: 'Previous 24 hour',
            data: data1,
            borderColor: '#bfbfbf',
            backgroundColor: '#bfbfbf',
            borderWidth: 3
            },
            {
            label: 'Current 24 hour',
            data: data2,
            borderColor: '#ff6666',
            backgroundColor: '#ff6666',
            borderWidth: 3
    
            }
          ]
        }
      }
      
    }
    function getUnitOfNumber(numberDigit){
      if(numberDigit <= 6){
        return 'K'
      }
      if(numberDigit > 6){
        return 'M'
      }
    }
    function generateMaxDataVlaue(chartDataObj){
      let maxDataValue = 0
      for(let i =0 ; i < chartDataObj.datasets.length ; i++){
        let currentDatasetMaxValue = Math.max(...chartDataObj.datasets[i].data)
        if(currentDatasetMaxValue > maxDataValue){
          maxDataValue = currentDatasetMaxValue
        }
      }
      return maxDataValue
    }
    const canvas = createCanvas(1024, 512)
    const ctx = canvas.getContext('2d')
    Chart.register(annotation)
    let chartDataObj = generateDataObj(dataObj,timeframe)
    let maxDataValue = generateMaxDataVlaue(chartDataObj)
    let maxChartValue = roundUp(maxDataValue)
    let digitCount = Math.floor(Math.log10(maxDataValue))
    let chartStepSize = roundUp(maxChartValue/2)
    Chart.defaults.font.size = 20;
    if(timeframe === 12){
      let chartA =  new Chart(ctx, 
        {
          type: 'line',
          data: chartDataObj,
          options: {
                  devicePixelRatio:2,
                  animation:false,
                  layout:{
                    padding:50
                  },
                  elements:{
                    point:{
                      radius: 0
                    }
                  },
                  scales: {
                  y: {                    
                    beginAtZero: true,
                    ticks:{
                      stepSize : chartStepSize,
                      callback: function(value) {
                        return (value/(function(unit){
                          if(unit === 'K'){
                            return 1000
                          }
                          else if(unit === 'M'){
                            return 1000000
                          }
                        })(getUnitOfNumber(digitCount+1))) + getUnitOfNumber(digitCount+1);
                      }
                    }
                  },
                  x:{
                    grid:{
                      display: false,
                    }, 
                  }
                },
                plugins:{ annotation: {
                  annotations: {
                    box1: {
                    type: 'box',
                    xMin: 12,
                    xMax: 24,
                    yMin: 0,
                    yMax: chartStepSize * 2,
                    backgroundColor: 'rgba(255, 200, 210, 0.25)'
                   },
                   label1: {
                    type: 'label',
                    xValue: 18,
                    yValue: maxChartValue + (((chartStepSize*2) - maxChartValue)/2),
                    content: ['Current 12 hours'],
                    font: {
                      size: 30
                    }
                   }
                  }
                }}
          },
          plugins:[{
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart, args, options) => {
                const {ctx} = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
              }
            }
          ]
        }
      );
      let base64string = canvas.toDataURL('image/jpeg')
      var regex = /^data:.+\/(.+);base64,(.*)$/;
      var matches = base64string.match(regex)
      return matches[2]
    }
    else if(timeframe === 24){
      let chartA =  new Chart(ctx, 
        {
          type: 'line',
          data: chartDataObj,
          options: {
                  devicePixelRatio:2,
                  animation:false,
                  layout:{
                    padding:50
                  },
                  elements:{
                    point:{
                      radius: 0
                    }
                  },
                  scales: {
                  y: {
                    beginAtZero: true,
                    ticks:{
                      stepSize : chartStepSize,
                      callback: function(value) {
                        return (value/(function(unit){
                          if(unit === 'K'){
                            return 1000
                          }
                          else if(unit === 'M'){
                            return 1000000
                          }
                        })(getUnitOfNumber(digitCount+1))) + getUnitOfNumber(digitCount+1);
                      }
                    }
                  },
                  x:{
                    grid:{
                      display: false,
                    }, 
                  }
                },
          },
          plugins:[{
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart, args, options) => {
                const {ctx} = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
              }
            }
          ]
        }
      );
      let base64string = canvas.toDataURL('image/jpeg')
      var regex = /^data:.+\/(.+);base64,(.*)$/;
      var matches = base64string.match(regex)
      return matches[2]
    }
  }
    