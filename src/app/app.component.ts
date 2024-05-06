import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	displayedColumns: string[] = ['id', 'hostName', 'planetName', 'discoveryMethod', "discoveryYear"];
	elementData!: ExoPlanet[];
  	dataSource!: MatTableDataSource<ExoPlanet>;

	domain: string = "http://localhost:8989"
	noneSelected = false;
	currentTablePage: number = 0;
	title = 'nasa-front';
	searchPlaceHolder = "Search";
	columns: string[] = [];
	searchType: string = "";
	tableData: ExoPlanet[] = [];
	toppings = new FormControl('');
	toppingList: string[] = ['Planet Name', 'Host Name', 'Discovery Method', 'Discovery Year'];

	show = {
		planetName: false,
		hostName: false,
		discoveryMethod: false,
		discoveryYear: false
	};
	filter = {
		planetName: "",
		hostName: "",
		discoveryMethod: "",
		discoveryYear: ""
	}
	name: string = '';


	ngAfterViewInit() {
		
	}

	constructor(private _liveAnnouncer: LiveAnnouncer) {
		this.getPlanets().then(data => {
			this.elementData = data;
			this.buildTable(this.elementData);
		});
	}
	

	selectItem(columnName: string){
		this.searchType = columnName;
		console.log(this.searchType);

		switch(columnName){
			case "Planet Name":
				this.show.planetName = !this.show.planetName;
				break;
			case "Host Name":
				this.show.hostName = !this.show.hostName;
				break;
			case "Discovery Method":
				this.show.discoveryMethod = !this.show.discoveryMethod;
				break;
			case "Discovery Year":
				this.show.discoveryYear = !this.show.discoveryYear;
				break;
			default:
				this.show.discoveryMethod = false;
				this.show.discoveryYear = false;
				this.show.hostName = false;
				this.show.planetName = false;
		}
	
	}

	announceSortChange(sortState: Sort) {
		if (sortState.direction) {
		  this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
		  this._liveAnnouncer.announce('Sorting cleared');
		}
	}

	cleanFields(){
		this.toppings = new FormControl('');
		this.selectItem("");
		this.buildTable(this.elementData);
		this.noneSelected = false;
	}

	loadMore(){
		this.currentTablePage++;
		console.log(this.currentTablePage)
		this.getPlanets().then(data => {
			this.elementData= this.elementData.concat(data);
			console.log(this.elementData)
			this.buildTable(this.elementData);
			this.filterBasedOnFields(false);
		});
	}

	buildTable(elementData: ExoPlanet[]){
		this.dataSource = new MatTableDataSource<ExoPlanet>(elementData);
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
	}

	async filterBasedOnFields(verifyFields: boolean){

		if(verifyFields)
			this.noneSelected = this.filter.discoveryYear.length == 0 && this.filter.discoveryMethod.length == 0 && this.filter.hostName.length == 0 && this.filter.planetName.length == 0;

		let copyElementData = this.elementData;
		if(this.filter.discoveryYear.length !== 0)
			copyElementData = copyElementData.filter(exo => exo.discoveryYear == this.filter.discoveryYear)
		if(this.filter.discoveryMethod.length !== 0)
			copyElementData = copyElementData.filter(exo => exo.discoveryMethod == this.filter.discoveryMethod)
		if(this.filter.hostName.length !== 0)
			copyElementData = copyElementData.filter(exo => exo.hostName == this.filter.hostName)
		if(this.filter.planetName.length !== 0)
			copyElementData = copyElementData.filter(exo => exo.planetName == this.filter.planetName)
		this.buildTable(copyElementData);

	}

	searchBasedOnFields(){
		this.getPlanetsBasedOnFields().then(data => {
			this.buildTable(data);
		});
	}

	async getPlanetsBasedOnFields(){
		let query = `page=${this.currentTablePage}&planetName=${this.filter.planetName}&hostName=${this.filter.hostName}&discoveryMethod=${this.filter.discoveryMethod}&discoveryYear=${this.filter.discoveryYear}`
		let url = `/nasa/filter?${query}`;
		console.log(url);
		return await this.makeRequest(url, "GET");
	}

	async getPlanets() {
		let url = `/nasa?page=${this.currentTablePage}`;
		return await this.makeRequest(url, "GET");
	}

	async makeRequest(resource: string, method: string){
		const response = await fetch(`${this.domain}${resource}`, {
			method: method,
			headers: new Headers({
				"Content-Type": "application/json; charset=utf8",
				Accept: "application/json",
			})
		});
		return response.json();
	}


}



interface ExoPlanet{ id: number; planetName: string; hostName: string; discoveryMethod: string; discoveryYear: string; }
