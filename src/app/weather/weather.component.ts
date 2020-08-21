import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { IWeatherData, IHourlyData } from './weatherData';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  private static DEFAULT_CITY = "toulon";

  public weatherSearchForm: FormGroup;
  public weather: any = null;
  public citiesList: any[] = [];
  public citySearchControl = new FormControl();
  public filteredCity: Observable<string[]>;

  constructor(private formBuilder: FormBuilder) {
    this.weatherSearchForm = this.formBuilder.group({
      location: ['']
    });
  }

  public ngOnInit(): void {
    this.preparelistCities();
    this.prepareWeather();
    this.filteredCity = this.citySearchControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : [])
    );
  }

  public prepareWeather() {
    let cityName: any;

    if (!this.citySearchControl.value) {
      cityName = WeatherComponent.DEFAULT_CITY;
    } else {
      cityName = this.citySearchControl.value.name;
    }
    fetch("https://www.prevision-meteo.ch/services/json/" + cityName)
      .then(res => res.json())
      .then((data: IWeatherData) => this.weather = this.transformData(data));
  }

  private transformData(weatherData: IWeatherData) {
    let transformedData = {
      ...weatherData,
      fcst_day_0: {
        ...weatherData.fcst_day_0,
        hourlyData: this.transformHourlyDatum(weatherData.fcst_day_0.hourly_data)
      }
    };
    return transformedData;
  }

  private transformHourlyDatum(hourlyData: IHourlyData) {
    return Object.entries(hourlyData).map(pair => {
      const [hour, data] = pair;
      return {
        ...data,
        hour: hour
      }
    })
  }

  public preparelistCities() {
    let cors_api_host = 'cors-anywhere.herokuapp.com';
    let cors_api_url = 'https://' + cors_api_host + '/http://www.prevision-meteo.ch/services/json/list-cities';
    fetch(cors_api_url)
      .then(res => res.json())
      .then(data => {
        this.citiesList = Object.values(data);
      })
  };

  private _filter(value: string): string[] {
    if (!value || value.length < 3) {
      return [];
    }
    const filterValue = this._normalizeValue(value);
    return this.citiesList.filter(city => this._normalizeValue(city.name).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  displayFn(citiesList: any): any[] {
    return citiesList && citiesList.name ? citiesList.name : '';
  }

}

export class DividerOverviewExample {}
