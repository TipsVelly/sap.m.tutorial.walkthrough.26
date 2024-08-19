sap.ui.define([
"sap/ui/core/mvc/Controller",
"sap/ui/model/json/JSONModel",
"sap/ui/model/Filter",
"sap/ui/model/FilterOperator",
"sap/m/MessageBox",
"sap/m/Label",
"sap/m/Input"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, Label, Input) {
	"use strict";
	return Controller.extend("ui5.walkthrough.controller.Yooeuiseion1", {
		onInit: function() {	
			// 기본 설정 셋팅
			this.initDefaultInfo();
			// 라우터 초기화
			// var oRouter = this.getOwnerComponent().getRouter();
			// oRouter.getRoute("yooeuiseion1").attachPatternMatched(this._onRouteMatched, this);
		},
		initDefaultInfo: function() {
			this.updated = false;
			this.search_model = this.getOwnerComponent().getModel("test_table_7143_yooeuiseion1_search_model");
			this.odata_model = this.getOwnerComponent().getModel("invoice");
			this.entity_set_name = "Invoices";
			this.dialog_name = "DialogTemplate01";
			this.getView().setModel(new JSONModel({}), "add_model");
			this.getView().setModel(new JSONModel(), "column_model");
			this.getView().setModel(new JSONModel({}), "update_model");
			this.add_model = this.getView().getModel("add_model");
			this.update_model = this.getView().getModel("update_model");
			this.oTable = this.byId("main_table");
		},

		// 검색 실행 함수
		onSearch: function() {
			const oModel = this.odata_model; // ODataModel 가져오기
			const oSearchModelData = this.search_model.getData(); // 검색 모델 데이터 가져오기

			const sEntitySet = this.entity_set_name; // 엔티티셋 이름 설정

			// 메타데이터에서 엔티티 타입 가져오기
			const oEntityType = this.getEntityType(oModel, sEntitySet);

			// 검색 모델 데이터를 기반으로 필터 생성
			const aFilters = this.createFilters(oSearchModelData, oEntityType);

			// 테이블 바인딩에 필터 적용
			const oBinding = this.oTable.getBinding('items');
			oBinding.filter(aFilters);
		},

		// 엔터티셋의 메타데이터에서 엔터티 타입을 가져오는 함수
		getEntityType: function(oModel, sEntitySet) {
			const oMetadata = oModel.getServiceMetadata(); // 서비스 메타데이터 가져오기

			// 메타데이터에서 엔터티셋을 찾고, 그에 따른 엔터티 타입을 반환
			for(const oSchema of oMetadata.dataServices.schema) {
				if(oSchema.entityContainer) { // entityContainer가 있을 때만 실행
					for (const oContainer of oSchema.entityContainer) {
						const oEntitySet = oContainer.entitySet.find((oSet) => oSet.name === sEntitySet);
						if (oEntitySet) {
							return oEntitySet.__entityType;
						}
					}
				}
			}

			return null; // 엔터티 타입을 찾지 못한 경우
		},

		// 엔터티 타입에서 특정 필드의 데이터 타입을 가져오는 함수
		getProperty: function(oEntityType, sKey) {
			let result = null;
			if(oEntityType) {
				// 엔터티 타입 내에서 필드 이름과 일치하는 속성의 타입을 찾음
				oEntityType.property.forEach((oProperty) => {
					if(oProperty.name === sKey) {
						result = oProperty;
					}
				});
			}

			return result; // 필드의 데이터 타입을 반환
		},

		// 검색 모델 데이터를 기반으로 필터를 생성하는 함수
		createFilters: function(oSearchModelData, oEntityType) {
			const aFilters = [];

			// 검색 모델 데이터의 각 키에 대한 필터 생성
			Object.entries(oSearchModelData).forEach(([key, value]) => {
				const oProperty = this.getProperty(oEntityType, key); // 필드 타입 가져오기

				if(oProperty) {
					if(oProperty.type === 'Edm.String') {
						// 필드 타입이 문자열인 경우, Contains 연산자 사용
						if(value) {
							aFilters.push(new Filter(key, FilterOperator.Contains, value));
						}
					} else {
						// 문자열이 아닌 경우 EQ 연산자 사용
						if(value) {
							var numericValue = Number(value); // 값을 숫자로 변환
							aFilters.push(new Filter(key, FilterOperator.EQ, numericValue));
						}
					}
				}
			});

            return aFilters; // 생성된 필터 배열을 반환
		}
		
	});
});