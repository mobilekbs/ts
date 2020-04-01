
import { Component, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, OnInit } from '@angular/core';

import { SchoolService } from '../shared/school.service';

import { NgbdSortableHeader, SortEvent, compare } from '../sortable.directive';

import { DatePipe } from '@angular/common';

import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  data_range: string = 'year';

  schoolCategoy: string = '';

  schoolName: string = '';

  targetYear: string = '2020';

  targetSchoolName: string = '';

  targetSchoolPercentage: string = '';

  targetSchool: string = '';

  targetSchoolStatus: any = '';

  selectedTargetSchool: any = '';

  consumptionSchoolName: any = '';

  generationSchoolName: any = '';

  page: number = 1;
  
  genPage: number = 1;
  
  gen_page: number = 1;

  gen_pages: number = 1;

  pageSize: number = 5;

  genPageSize: number = 5;

  SchoolsList: any = [];

  count: number = 1;

  SchoolsListWithoutSorting: any = [];

  GenerationData: any = [];

  GenerationDataWithoutSorting: any = [];

  ConsumptionGraphData: any = [];

  GenerationGraphData: any = [];

  ConsumptionGraphDataWithoutSorting: any = [];

  schoolReport: object = { };

  schoolGenReport: object = { };

  schoolConReport: object = { };

  active_tab: string = 'consumption';

  firstGenRecord:object = { };

  firstConRecord:object = { };
  
  basLineYear: string = '2017';

  loadLinechartLabel:any = [];

  loadBarchartLabel:any = [];

  loadBarchartData:any = [];

  loadSelectedBarchartData:any = [];

  schoolLineChartData:any = [];

  selectedLineChartData:any = [];

  schoolBarChartData:any = [];


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    public schoolService: SchoolService,private route: ActivatedRoute
  ){ }

  onSort({column, direction}: SortEvent) {
    
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting schools
    if (direction === '') {
      this.SchoolsList = this.SchoolsListWithoutSorting;
    } else {
      let SCHOOLS = this.SchoolsList
      this.SchoolsList = [...SCHOOLS].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? -res : res;
      });
    }
  }

  // on Sort generation tab
  onSortGen({column, direction}: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting schools
    if (direction === '') {
      this.GenerationData = this.GenerationDataWithoutSorting;
    } else {
      let SCHOOLS = this.GenerationData
      this.GenerationData = [...SCHOOLS].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? -res : res;
      });
    }
  }

  ngOnInit() {

    this.lineGraphOnLoad()

    this.schoolLinegraphOnLoad()

    this.bargraphOnLoad()

    this.schoolBargraphOnLoad()

    this.getConsumptionGraphData()

    // inline plugin
    this.textPlugin = [{
      id: 'myChart',
      beforeDraw(chart: any): any {
        const width = chart.chart.width;
        const height = chart.chart.height;
        const ctx = chart.chart.ctx;
        ctx.restore();
        const fontSize = (height / 114).toFixed(2);
        ctx.font = `${fontSize}em sans-serif`;
        ctx.textBaseline = 'middle';
        const text = '';
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }];

    this.inlinePlugin = this.textPlugin;
   
    this.getSchoolsList()

    this.getPowerGenerationData()

    const queryStrings = this.route.snapshot.queryParams

    this.targetSchool = queryStrings.n
  } 

  barChartOptions: any = {

    scaleShowVerticalLines: false,

    responsive: true,

    tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';
                    var val = tooltipItem.yLabel
                    if (label) {
                      return label+' '+ val+'%';
                    }
                    
                }
            }
        },
    scales: {
          xAxes: [{
            gridLines: {
                display: false
            }
          }],
          yAxes: [{
              ticks: {
                callback: function(value, index, values) {
                    return value + ' %';
                }
              }
          }]
      }
  };
  
  barChartType = 'bar';

  barChartLegend = false;

  barChartLabel = this.loadBarchartLabel;

  barChartColors: Array<any> = [
    {},{},{
      backgroundColor: '#ff3b3b',
      borderColor: '#ff4949',
    }
  ];
  
  // events
  chartClicked(e: any): void {
    // console.log(e);
  }

  chartHovered(e: any): void {
    // console.log(e);
  }

  randomize(): void {
    // Only Change 3 values
    const data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100),
      56,
      (Math.random() * 100),
      40];
   
    /**
     * (My guess), for Angular to recognize the change in the dataset
     * it has to change the dataset variable directly,
     * so one way around it, is to clone the data, change it and then
     * assign it;
     */
  }
  async delay(ms: number) {

    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
  }
  
  filter(arr){
    var filterArr = arr.filter(function (item) {
          return item != undefined;
      });
    return filterArr
  }

  lineGraphOnLoad(){

    let month_range = (this.data_range == 'year') ? 12 : 1;
    
    this.schoolService.GetConsumptionGraphData(month_range).subscribe((data: {}) => {
    
    this.delay(200).then(any=>{
      
      var  records = data['data']

      let pipe = new DatePipe('en-US');

      var firstValArr = records.map(item => {
        if(item.first_level == this.schoolName){
           return item.progress
        }
      })

      var firstValArr = this.filter(firstValArr) 

      var secondValArr = records.map(item => {
        if(item.first_level == this.schoolName){
           return this.targetSchoolPercentage
        }
      })

      var secondValArr = this.filter(secondValArr) 

      var label = records.map(item => {

      let date = new Date(item.month)

      var year = pipe.transform(date, 'y') 
        if(item.first_level == this.schoolName){
           var month = pipe.transform(date, 'MMM yy')
           return month;
        }
      })

      var label = this.filter(label) 

      this.schoolLineChartData =  [
      {
        label: 'English Schools Foundation',
        fill: true,
        backgroundColor: '#e88d96',
        borderColor: '#ff3b3b',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'red',
        pointBackgroundColor: 'red',
        pointBorderWidth: 4,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'red',
        pointHoverBorderColor: 'red',
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 10,
        data: firstValArr
      },
      {  
        label: 'Target',
        fill: false,    
        borderColor: '#36b294',
        borderCapStyle: 'butt',
        borderDash: [5],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: '#36b294',
        pointBackgroundColor: '#36b294',
        pointBorderWidth: 4,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#36b294',
        pointHoverBorderColor: '#36b294',
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 2,
        data:secondValArr
      },
    ]; 
    
    this.loadLinechartLabel = label;

      });
    })
  }

  schoolLinegraphOnLoad() {

    let month_range = (this.data_range == 'year') ? 12 : 1;
    
    this.schoolService.GetConsumptionGraphData(month_range).subscribe((data: {}) => {
      var  records = data['data']

      let pipe = new DatePipe('en-US');

      var firstValArr = records.map(item => {
        if(item.first_level == this.schoolName){
           return item.progress
        }
      })

      var firstValArr = this.filter(firstValArr) 

      var secondValArr = records.map(item => {
        if(item.first_level == this.schoolName){
           return this.targetSchoolPercentage
        }
      })

      var secondValArr = this.filter(secondValArr) 

      var thiredValArr = records.map(item => {
        if(item.first_level == 'English Schools Foundation'){
             return item.progress
        }
      })
      
      var thiredValArr = this.filter(thiredValArr)

      this.selectedLineChartData =  [
       {
        "label": "English Schools Foundation",
        "fill": true,
        "backgroundColor": "#e88d96",
        "borderColor": "red",
        "borderCapStyle": "butt",
        "borderDash": [],
        "borderDashOffset": 0,
        "borderJoinStyle": "miter",
        "pointBorderColor": "red",
        "pointBackgroundColor": "red",
        "pointBorderWidth": 4,
        "pointHoverRadius": 5,
        "pointHoverBackgroundColor": "red",
        "pointHoverBorderColor": "red", 
        "pointHoverBorderWidth": 0, 
        "pointRadius": 0, 
        "pointHitRadius": 10, 
        "data": thiredValArr
      },
      {
        "label": "Target", 
         "fill": false, 
         "borderColor": "#36b294", 
         "backgroundColor": "#36b294",
         "borderCapStyle": "butt", 
         "borderDash": [ 5 ], 
         "borderDashOffset": 0, 
         "borderJoinStyle": "miter", 
         "pointBorderColor": "#36b294", 
         "pointBackgroundColor": "#36b294", 
         "pointBorderWidth": 4, 
         "pointHoverRadius": 5, 
         "pointHoverBackgroundColor": "#36b294", 
         "pointHoverBorderColor": "#36b294", 
         "pointHoverBorderWidth": 0, 
         "pointRadius": 0, 
         "pointHitRadius": 2, 
         "data": secondValArr
      },
      {
        "label": this.schoolName,
        "fill": false,
        "backgroundColor": "#84c0ff",
        "borderColor": "#84c0ff",
        "borderCapStyle": "butt",
        "borderDash": [],
        "borderDashOffset": 0,
        "borderJoinStyle": "miter",
        "pointBorderColor": "#84c0ff",
        "pointBackgroundColor": "#84c0ff",
        "pointBorderWidth": 4,
        "pointHoverRadius": 5,
        "pointHoverBackgroundColor": "#84c0ff",
        "pointHoverBorderColor": "#84c0ff", 
        "pointHoverBorderWidth": 0, 
        "pointRadius": 0, 
        "pointHitRadius": 10, 
        "data": firstValArr

      }
    ];
   })
  }
  //Line chart 
 
  lineChartColors: Array<any> = [{}];

  lineChartOptions: any = {
     responsive: true,
      tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';
                    var val = tooltipItem.yLabel
                    if (label) {
                      return label+' '+ val+'%';
                    }
                    
                }
            }
        },
     scales: {
          xAxes: [{
            gridLines: {
                display: false
            }
          }],
          yAxes: [{
              ticks: {
                callback: function(value, index, values) {
                    return value + ' %';
                }
              }
          }]
      }
  };

  lineChartLegend = false;
  
  lineChartType = 'line';
  
  inlinePlugin: any;
  
  textPlugin: any;
  
  lineChartLabels = this.loadLinechartLabel 
  
  lineChartSchoolData = this.schoolLineChartData 

  lineChartData = this.selectedLineChartData 
  
  //Slider 

  slideConfig = {
    "autoplay": true, 
    "autoplaySpeed": 3000, 
    "slidesToShow": 2, 
    "slidesToScroll": 2,
    "dots": true
  };
  
  slickInit(e) {
    // console.log('slick initialized');
  }
  
  breakpoint(e) {
    // console.log('breakpoint');
  }
  
  afterChange(e) {
    // console.log('afterChange');
  }
  
  beforeChange(e) {
    // console.log('beforeChange');
  }

  /* Computed Properties starts */  
  bargraphOnLoad(){

    let month_range = 1;

    this.schoolService.GetConsumptionGraphData(month_range).subscribe((data: {}) => {
    
    this.delay(200).then(any =>{
     var  records = data['data']
     let pipe = new DatePipe('en-US');
     var label = records.map(record => {
         if(record.first_level == this.schoolName){
            let date = new Date(record.month)
            var year = pipe.transform(date, 'MMM yy')
            return year;
          }
      })
     
     this.loadBarchartLabel = this.filter(label)
     
     var firstArr = records.map(record => {
         if(record.first_level == 'English Schools Foundation'){
          return record.monthly_performance
         }
      })
      var secondArr = records.map(record => {
         if(record.first_level == 'English Schools Foundation'){
          return this.targetSchoolPercentage
         }
      })

      var firstArr = this.filter(firstArr)
    
      var secondArr = this.filter(secondArr)
        
      this.loadBarchartData = [
        {},

        {label:'Target', data: secondArr,fill: false,borderDash: [5],borderColor: '#36b294',type: "line",pointHoverBorderWidth: 0,
          pointRadius: 0, pointBackgroundColor:'#36b294',  pointHitRadius: 0,},

        {label:'English Schools Foundation', data: firstArr,backgroundColor: "red"  }
      ]; 

      })
    })

  }

  schoolBargraphOnLoad(){

    let month_range = 1;

    this.schoolService.GetConsumptionGraphData(month_range).subscribe((data: {}) => {
    
    this.delay(200).then(any =>{
      var  records = data['data']
      let pipe = new DatePipe('en-US');
   
      var firstArr = records.map(record => {
         if(record.first_level == 'English Schools Foundation'){
          return record.monthly_performance
         }
      })
      var secondArr = records.map(record => {
         if(record.first_level == 'English Schools Foundation'){
          return this.targetSchoolPercentage
         }
      })
      var thiredArr = records.map(record => {
         if(record.first_level == this.schoolName){
         return record.monthly_performance
         }
      })
      var firstArr = this.filter(firstArr)

      var secondArr = this.filter(secondArr)

      var thiredArr = this.filter(thiredArr)

      this.loadSelectedBarchartData = [
    
        {label:this.schoolName, data: thiredArr,fill: false,borderDash: [],borderColor: '#84c0ff', pointBackgroundColor:'#84c0ff',type: "line",pointHoverBorderWidth: 0,
          pointRadius: 1,  pointHitRadius: 0,},

        {label:'Target', data: secondArr,fill: false,backgroundColor: '',borderDash: [5],borderColor: '#36b294',  pointBackgroundColor:'#36b294',type: "line",pointHoverBorderWidth: 0,
          pointRadius: 0,  pointHitRadius: 0},

        {label:'English Schools Foundation', data: firstArr,backgroundColor: "red"  }
      ]; 

      })
    })
  }

  get getTargetYears(){

    let pipe = new DatePipe('en-US'); 
    
    var school = this.schoolName;
    
    var y = this.ConsumptionGraphData.map(record => {
         if(record.first_level == this.schoolName){
            let date = new Date(record.month)
            var year = pipe.transform(date, 'y')
            return year
         }
    })

    var label = this.filter(y)

    var year = label.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    });
    
    return year;
  }

  /* Computed Properties ends */  
  getSchoolCategory(val){

    this.schoolCategoy = val

    return this.schoolService.GetSchools().subscribe((data: {}) => {

      let schools = data['data']
      
      var label = schools.filter(function (item) {
          
          if(item.site_category == val)
          {
           return item;
          }
          if(val == 'all')
          {
           return item;
          }
        }); 
      this.SchoolsList = label;
      
      this.SchoolsListWithoutSorting = label;
    })
  }

  getConsumptionGraphData() {
   
    let month_range = (this.data_range == 'year') ? 12 : 1;
   
    return this.schoolService.GetConsumptionGraphData(month_range).subscribe((data: {}) => {
    
      let records = data['data']
    
      this.ConsumptionGraphData = records;
    
      this.ConsumptionGraphDataWithoutSorting = records;
    })
  }

  getGenSchoolCategory(val){

    this.schoolCategoy = val

    let month_range = (this.data_range == 'year') ? 12 : 1;

    return this.schoolService.GetGenerationData(month_range).subscribe((data: {}) => {
      let schools = data['data']
       
      var label = schools.filter(function (item)
       {
          if(item.site_category == val)
          {
           return item;
          }

          if(val == 'all')
          {
           return 0 ;
          }
        });
       if(label== '')
       {
        this.getPowerGenerationData()
       }
      
      this.GenerationData = label;
      
      this.GenerationDataWithoutSorting = label;
    })
  }

  getTargetYear(year){

    this.targetYear = year
  }

  getSchoolsList() {

    return this.schoolService.GetSchools().subscribe((data: {}) => {
    
      let schools = data['data']
    
      const schoolOnTop = 'English Schools Foundation'
    
      var school = [
                schools.find(school => school.first_level == schoolOnTop), 
                ...schools.filter(school => school.first_level !== schoolOnTop)
              ];
      
      var getTargetSchoolSttaus = [
                schools.find(school => school.first_level == this.targetSchool), 
                ...schools.filter(school => school.first_level !== this.targetSchool)
              ]; 
      
      if(getTargetSchoolSttaus.length!=0 && getTargetSchoolSttaus[0])
      {
        this.targetSchoolStatus = getTargetSchoolSttaus[0].opt_in_competition
        this.targetSchoolPercentage = getTargetSchoolSttaus[0].target
      }                
      
      if(school.length != 0 && school[0])
      {
        this.schoolName = school[0].first_level
        
        this.consumptionSchoolName = school[0].first_level
        
        this.targetSchoolPercentage = school[0].target
        
        this.schoolConReport =  { first_level: school[0].first_level, site_category: school[0].site_category, opt_in_competition: school[0].opt_in_competition,
                 power: school[0].power,target:school[0].target,progress: school[0].progress, to_trees: Math.abs(school[0].to_trees), to_cars: Math.abs(school[0].to_cars), to_flithgs: Math.abs(school[0].to_flithgs), to_flats: Math.abs(school[0].to_flats) }
        
        this.firstConRecord = this.schoolConReport
        
        this.selectedTargetSchool = school[0].target
     
        var school = school.splice(1);   
       }    

        this.SchoolsList = school;
      
        this.SchoolsListWithoutSorting = school;
    })
  }

  getPowerGenerationData() {
    
    let month_range = (this.data_range == 'year') ? 12 : 1;
    
    return this.schoolService.GetGenerationData(month_range).subscribe((data: {}) => {
      
      let records = data['data']

      const schoolOnTop = 'English Schools Foundation'

      var school = [
                records.find(school => school.first_level == schoolOnTop), 
                ...records.filter(school => school.first_level !== schoolOnTop)
              ];

      var getTargetSchoolSttaus = [
                school.find(school => school.first_level == this.targetSchool), 
                ...school.filter(school => school.first_level !== this.targetSchool)
              ]; 
              
      if(getTargetSchoolSttaus.length!=0 && getTargetSchoolSttaus[0])
      {
       
        this.targetSchoolStatus = getTargetSchoolSttaus[0].opt_in_competition
      }            
      if(school.length != 0 && school[0])
      { 
        this.schoolName = school[0].first_level

        this.generationSchoolName = school[0].first_level
            
        this.schoolGenReport =  { first_level: school[0].first_level, site_category: school[0].site_category, opt_in_competition: school[0].opt_in_competition,
                 power: school[0].power,progress: school[0].progress, to_trees: Math.abs(school[0].to_trees), to_cars: Math.abs(school[0].to_cars), to_flithgs: Math.abs(school[0].to_flithgs), to_flats: Math.abs(school[0].to_flats) }
        
        this.firstGenRecord = this.schoolGenReport
        
        var school = school.splice(1); 
      }

      this.GenerationData = school;

      this.GenerationDataWithoutSorting = school;

    })
  }

  showSchoolReport(school, tab) {

      if(school == 'English-School')
      {
       
        this.schoolName = 'English Schools Foundation'
        
        this.consumptionSchoolName = 'English Schools Foundation'
        
        this.schoolConReport = this.firstConRecord
        
        this.targetSchoolPercentage = this.selectedTargetSchool;
      
      }else{ 
        this.consumptionSchoolName = school.first_level

        this.schoolName = school.first_level
        
        
        this.schoolLinegraphOnLoad()

        this.schoolBargraphOnLoad()
        
        this.schoolReport = school 
        
        this.targetSchoolPercentage =school.target

        if(school.opt_in_competition == false || this.targetSchoolStatus == false )
        {
            this.consumptionSchoolName = 'N/A'
        }
        if(this.targetSchool == school.first_level)
        {
            this.consumptionSchoolName = school.first_level
        }

        var matches = this.consumptionSchoolName.match(/\b(\w)/g); // ['J','S','O','N']
        
        var acronym = matches.join(''); // JSON
        
        this.targetSchoolName = acronym   
        
        this.schoolConReport =  { first_level: school.first_level, site_category: school.site_category, opt_in_competition: school.opt_in_competition,
                   power: school.power,target: school.target,progress: school.progress, to_trees: Math.abs(school.to_trees), to_cars: Math.abs(school.to_cars), to_flithgs: Math.abs(school.to_flithgs), to_flats: Math.abs(school.to_flats) }

      }
  } 

  showSchoolGenReport(school, tab) {
 
    if(school == 'English-School')
    {
     
        this.schoolName = 'English Schools Foundation'

        this.generationSchoolName = 'English Schools Foundation'

        this.schoolGenReport = this.firstGenRecord

        this.targetSchoolPercentage = this.selectedTargetSchool;
    }
    else{
        this.schoolName  = school.first_level

        this.generationSchoolName  = school.first_level

       

        this.schoolReport = school

        this.targetSchoolPercentage =school.target

        if(school.opt_in_competition == false || this.targetSchoolStatus == false )
        {
            this.generationSchoolName = 'N/A'
        }
        if(this.targetSchool == school.first_level){
              this.generationSchoolName = school.first_level
        }

        this.schoolGenReport =  { first_level: school.first_level, site_category: school.site_category, opt_in_competition: school.opt_in_competition,
                 power: school.power,progress: school.progress, to_trees: Math.abs(school.to_trees), to_cars: Math.abs(school.to_cars), to_flithgs: Math.abs(school.to_flithgs), to_flats: Math.abs(school.to_flats) }
  
    }             

  } 

  dataRangeChange(event) {
   
    this.data_range = event
    
    if(this.active_tab == 'generation')
    {
      this.getPowerGenerationData()
    }

  }

  changeTab(tab) {

    if(tab.nextId == 'generation')
    {
    
      this.getPowerGenerationData()
   
    }else{

      this.getSchoolsList()
    
    }
    let at = tab.nextId
    
    this.active_tab = at
  }

}
