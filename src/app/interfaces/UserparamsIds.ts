export interface IUserparamsIds {
  itemlist: {
    id: number;
    properties: {
      typeId: number;
      elementsPerPage: number;
      propertiesOrder: number;
      propertieshidden: number;
    }
  }
  csvimport: {
    id: number;
    properties: {
      typeId: number;
      mappingCols: number;
      joiningFields: number;
    }
  }
}
