import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { IItem } from 'src/app/interfaces/Item';
import { IItemCreate } from 'src/app/interfaces/ItemCreate';
import { BackendService } from 'src/app/services/backend.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';

@Component({
  selector: 'app-itemimport',
  templateUrl: './itemimport.component.html',
  styleUrls: ['./itemimport.component.scss'],
})
export class ItemimportComponent implements OnInit {

  public fileToUpload: File | null = null;
  public csvRecords: any[] = [];
  public header = false;
  public typeId = 0;
  public properties: any[] = [
    {
      name: 'name',
      id: 0
    }
  ];
  public mappingFields :any[] = [];
  public joiningFields :any[] = [];
  public modelName :string = '';
  public importState = 'prepare';
  public numberImported = 0;
  public modelList :IItem[] = [];
  public modelListSelect :any = [];
  public modelSelected :number = 0;

  public valProgressBar = 0;
  public modalImportStatus = false;

  constructor(
    private ngxCsvParser: NgxCsvParser,
    private backend: BackendService,
    private route: ActivatedRoute,
    private globalVars: GlobalVarsService
  ) {

  }

  ngOnInit() {
    this.backend.initialized.subscribe((res :any) => {
      let typeId = this.route.snapshot.paramMap.get('id');
      if (typeId !== null) {
        this.typeId = +typeId;
      }
      this.backend.getType(this.typeId)
      .subscribe((res: any) => {
        for (let prop of res['properties']) {
          this.properties.push({
            name: prop.name,
            id: prop.id
          });
        }
      });
      this.loadUserparams();
    });
  }

  public handleFileInput(files: any) {
    this.manageUploadedFile(files.srcElement.files);
  }

  public async importCSV() {
    // check if name field defined
    this.modalImportStatus = true;
    let fieldName = null;
    let propertiesMapping = [];
    for (let index in this.mappingFields) {
      if (this.mappingFields[index] !== null && this.mappingFields[index].id === 0) {
        fieldName = index;
      } else if (this.mappingFields[index] !== null) {
        propertiesMapping.push({
          index,
          id: this.mappingFields[index].id
        });
      }
    }
    if (fieldName === null) {
      console.log('Error, no field name defined');
      return;
    }
    this.importState = 'import';
    for (let fields of this.csvRecords.slice(1)) {
      // TODO manage search item and update if found with the joining fields (search code in backend not yet finished)

      let data: IItemCreate = {
        name: fields[fieldName],
        type_id: this.typeId,
        properties: [],
      };
      for (let map of propertiesMapping) {
        if (fields[Number(map.index)] !== undefined) {
          data.properties.push({
            property_id: map.id,
            value: fields[Number(map.index)]
          });
        }
      }
      await this.backend.createItem(data);
      this.numberImported += 1;
      this.valProgressBar = Math.ceil((100 * this.numberImported) / (this.csvRecords.length - 1));
      setTimeout(() => {  console.log("Pause"); }, 500);
    }    
  }

  public hasColsDefined() {
    if (this.mappingFields.find(item => item !== null)) {
      return false;
    }
    return true;
  }

  public drop(ev: any) {
    ev.preventDefault()
  }

  public onFileDropped(files:any) {
    this.manageUploadedFile(files);
  }

  public saveCSVModel() {
    if (this.globalVars.userparams.csvimport !== null) {
      // manage mappingFields
      let mappingFields = [];
      for (let item of this.mappingFields) {
        if (item === null) {
          mappingFields.push(null);
        } else {
          mappingFields.push(item.id);
        }
      }

      if (this.modelSelected > 0) {
        this.backend.patchItemProperty(
          this.modelSelected, 
          this.globalVars.userparams.csvimport.properties.mappingCols, 
          JSON.stringify(mappingFields))
        .subscribe();
        this.backend.patchItemProperty(
          this.modelSelected, 
          this.globalVars.userparams.csvimport.properties.joiningFields, 
          JSON.stringify(this.joiningFields))
        .subscribe();
        this.loadUserparams();
      } else {
        let data: IItemCreate = {
          name: this.modelName,
          type_id: this.globalVars.userparams.csvimport.id,
          properties: [
            {
              property_id: this.globalVars.userparams.csvimport.properties.typeId,
              value: this.typeId.toString()
            },
            {
              property_id: this.globalVars.userparams.csvimport.properties.mappingCols,
              value: JSON.stringify(mappingFields)
            },
            {
              property_id: this.globalVars.userparams.csvimport.properties.joiningFields,
              value: JSON.stringify(this.joiningFields)
            }
          ],
        };
        this.backend.createItem(data);
      }
    }
  }

  // load model
  public selectModelById() {
    let model = this.modelList.find(element => element.id === Number(this.modelSelected));
    if (model !== undefined) {
      for (let property of model.properties) {
        if (property.name === 'property ids cols mapping (string)') {
          let values = JSON.parse(property.value);
          for (let idx in values) {
            if (values[idx] === null) {
              this.mappingFields[Number(idx)] = null;
            } else {
              let prop = this.properties.find(element => element.id === values[idx]);
              if (prop !== undefined) {
                this.mappingFields[Number(idx)] = prop;
              }
            }
          }
        } else if (property.name === 'joining fields (string)') {
          this.joiningFields = JSON.parse(property.value);
        }
      }
    }
  }

  public closeModal() {
    this.valProgressBar = 0;
    this.importState = 'prepare';
    this.modalImportStatus = false;
  }

  private async readFile(file: any) {
    return await file.text();
  }

  private manageUploadedFile(files: any) {
    if (files[0].type && files[0].type !== 'text/csv') {
      console.log('File is not a CSV file.', files[0].type, files[0]);
      return;
    }
    // detect the delimiter
    let delimiter = ';';

    // TODO get the file content to detect delimiter
    const fileContent = this.readFile(files[0]);
    fileContent.then((filecont) => {
      const countComa = (filecont.match(/\,/g) || []).length;
      const countSemicolon = (filecont.match(/\;/g) || []).length;
      if (countComa > countSemicolon) {
        delimiter = ',';
      }
  
      // Parse the file you want to select for the operation along with the configuration
      this.ngxCsvParser.parse(files[0], { header: this.header, delimiter })
        .pipe().subscribe((result: any) => {
  
          for (let field of result[0]) {
            this.mappingFields.push(null);
            this.joiningFields.push(false);
          }
          this.csvRecords = result;
        }, (error: NgxCSVParserError) => {
          console.log('Error', error);
        });
    });
  }

  private async loadUserparams() {
    // store into var
    if (this.globalVars.userparams.csvimport !== null) {
      let res: any = await this.backend.getItems(this.globalVars.userparams.csvimport.id);
      let modelList :IItem[] = [];
      let modelListSelect :any = [];
      for (let item of res.body) {
        modelList.push(item);
        modelListSelect.push({
          id: item.id,
          name: item.name
        });
      }
      this.modelList = modelList;
      this.modelListSelect = modelListSelect;
    }
  }
}
