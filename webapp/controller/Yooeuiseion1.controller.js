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
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("yooeuiseion1").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.search_model.setData({});
			this.onSearch();
		},
		initDefaultInfo: function() {
			this.isUpdated = false;
			this.sSelectedPath  = null;
			this.search_model = this.getOwnerComponent().getModel("test_table_7143_yooeuiseion1_search_model");
			this.odata_model_name = "invoice";
			this.odata_model = this.getOwnerComponent().getModel(this.odata_model_name);
			this.entity_set_name = "Invoices";
			this.dialog_name = "DialogTemplate01";
			this.getView().setModel(new JSONModel({}), "add_model");
			this.getView().setModel(new JSONModel({}), "update_model");
			this.add_model = this.getView().getModel("add_model");
			this.update_model = this.getView().getModel("update_model");
			this.oTable = this.byId("main_table");
		},

		// 검색 실행 함수
		onSearch: function() {
			// 검색 실행 함수
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
			// 엔터티셋의 메타데이터에서 엔터티 타입을 가져오는 함수
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
			// 엔터티 타입에서 특정 필드의 데이터 타입을 가져오는 함수
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
			// 검색 모델 데이터를 기반으로 필터를 생성하는 함수
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
		},

		onAdd: async function() {
			// 추가 버튼 실행 함수
			// 다이로그 열기
			this.isUpdated=false;
			await this.onOpenInputDialog({
				isUpdate: this.isUpdated,
				rowData: null
			});
		},

		onListItemPress: async function(oEvent) {
			this.isUpdated = true;
			const oListItem = oEvent.getParameter("listItem");	// 클릭된 아이템
			const oBindingContext = oListItem.getBindingContext(this.odata_model_name);
			const oSelectedData  = oBindingContext.getObject();  // 선택된 행의 데이터

			// 선택한 행의 경로 저장
			this.sSelectedPath = oBindingContext.getPath();


			// 다이얼로그 열기
			await this.onOpenInputDialog({
				isUpdate: this.isUpdated,
				rowData: oSelectedData	// 선택된 데이터 객체
			});
		},

		 // 다이얼로그 함수
		 onOpenInputDialog: async function(settings) {
			// 다이얼로그 함수
			this.oDialog ??= await this.loadFragment({
				name:"ui5.walkthrough.view.fragments.DialogTemplate01"
			});

			// 설정 객체가 null이거나 undefined이면 등록 모드로 설정
			const isUpdate = settings?.isUpdate || false;
			const rowData = settings?.rowData || null;

			// 다이얼로그 타이틀 설정
			this.oDialog.setTitle(isUpdate ? "데이터 수정" : "데이터 등록");

			// 다이얼로그 입력 필드를 생성하거나 초기화
			this._createDialogInputs(isUpdate);
			
 			// 다이얼로그의 Submit 버튼을 동적으로 설정
			 const oSubmitButton = this.byId("idSaveButton");

 			// 기존의 모든 press 이벤트 제거
			oSubmitButton.detachPress();

			 if(isUpdate) {	 
				// update_model에 선택된 데이터를 설정
				this.update_model.setData(rowData);

				// Submit 버튼의 동작 설정 (업데이트)
				oSubmitButton.setText("Update");
				

			 } else {
				// 등록모드: add_model 초기화
				this.add_model.setData({});

				// Submit 버튼의 동작 설정 (등록)
				oSubmitButton.setText("Register");
				
			 }
			
			this.oDialog.open();
		},

		// 다이얼로그의 입력 필드를 테이블 컬럼 기반으로 생성 함수
		_createDialogInputs: function(isUpdate) {
			// 다이얼로그의 입력 필드를 테이블 컬럼 기반으로 생성 함수
			const oTable = this.oTable; // 테이블 컴포넌트
			const oColumns = oTable.getColumns();	// 테이블의 컬럼 배열
			const oForm = this.byId('dialogForm');	// 다이얼로그 내의 SimpleForm

			oForm.removeAllContent();	// 기존에 있는 컨텐츠를 초기화
			
			oColumns.forEach((oColumn) => {
				const sLabel = oColumn.getHeader().getText(); // 컬럼의 헤더 텍스트
				const sProperty = oColumn.getCustomData()[0].getValue(); // 바인딩된 속성 이름

				// Label 및 Input을 동적으로 생성하여 SimpleForm에 추가
				oForm.addContent(new Label({text: sLabel}));
				oForm.addContent(new Input({
					value: `{${isUpdate ? 'update_model' : 'add_model'}>/${sProperty}}`
				}));
			});
		},

		onSubmitDialogButton: function() {
			// submit 버튼 실행 함수
			if(this.isUpdated) {
				this.onUpdate();
			} else {
				this.onRegister();
			}
		},

		onCloseDialogButton: function() {
			this.oDialog.close(); // dialog 닫기
		},

		// 유효성 검사 함수
		validateInputs: function(modelName) {
			// 유효성 검사 함수
			const oModel = this.getView().getModel(modelName);
			const oData = oModel.getData();
		
			// 상품명 검증
			if (!oData.ProductName || oData.ProductName.trim() === "") {
				MessageBox.error("상품명을 입력해야 합니다.");
				return false;
			}
		
			// 수량 검증
			if (!oData.Quantity || isNaN(oData.Quantity) || oData.Quantity <= 0) {
				MessageBox.error("수량을 올바르게 입력해야 합니다.");
				return false;
			}
		
			// 택배사 검증
			if (!oData.ShipperName || oData.ShipperName.trim() === "") {
				MessageBox.error("택배사를 입력해야 합니다.");
				return false;
			}
		
			// 가격 검증
			if (!oData.ExtendedPrice || isNaN(oData.ExtendedPrice) || oData.ExtendedPrice <= 0) {
				MessageBox.error("가격을 올바르게 입력해야 합니다.");
				return false;
			}
		
			// 모든 검증을 통과한 경우
			return true;
		},
		// 기존 데이터 비교 후 변화 여부 체크 함수
		isDataChanged: function(oNewData, oOldData) {
			// 기존 데이터 비교 후 변화 여부 체크 함수
			return JSON.stringify(oNewData) !== JSON.stringify(oOldData);
		},

		// 등록 함수
		onRegister: function() {
			// 등록 함수
			if(!this.validateInputs("add_model")) {
				return; // 첫 번째 유효성 검사에서 실패하면 등록을 중단
			}

			const oNewData = this.add_model.getData();	// 새로 추가할 데이터 가져오기
			this.odata_model.create("/" + this.entity_set_name, oNewData, {
				success: () => {
					MessageBox.success("데이터가 성공적으로 등록되었습니다.");
				},
				error: () => {
					MessageBox.error("데이터 등록에 실패하였습니다.");
				}
			});

			this.onCloseDialogButton();
		},

		// 수정 함수
		onUpdate: function() {
			// 수정 함수
			const oUpdatedData = this.update_model.getData(); // 수정된 데이터 가져오기
			const oModel = this.oTable.getModel(this.odata_model_name); // 특정 모델 이름을 사용하여 모델 참조
			const sPath = this.sSelectedPath; // 선택된 항목의 경로 가져오기
			const oOldData = oModel.getProperty(sPath); // 기존 데이터 가져오기
		
			// 데이터 변경점 확인
			if (!this.isDataChanged(oUpdatedData, oOldData)) {
				MessageBox.information("변경점이 없습니다.");
				return; // 변경점이 없으므로 업데이트 중단
			}
		
			// 유효성 검사
			if (!this.validateInputs("update_model")) {
				return; // 유효성 검사가 실패하면 업데이트 중단
			}
			
			
			// 데이터가 변경되었고 유효성 검사를 통과한 경우에만 업데이트 진행
			this.odata_model.update(sPath, oUpdatedData, {
				success: function() {
					MessageBox.success("데이터가 성공적으로 업데이트되었습니다.");
				},
				error: function() {
					MessageBox.error("데이터 업데이트에 실패하였습니다.");
				}
			});
		
			this.onCloseDialogButton(); // 다이얼로그 닫기
		},

		onDelete: function() {
			// 삭제 함수
			// 현재 테이블에서 선택된 항목들의 컨텍스트를 가져옵니다.
			const aSelectedContexts = this.oTable.getSelectedContexts();
		
			// 선택된 항목이 없는 경우, 경고 메시지를 표시하고 함수 실행을 중단합니다.
			if (aSelectedContexts.length === 0) {
				MessageBox.warning("삭제할 데이터를 선택하세요.");
				return;
			}
		
			// 사용자가 삭제를 확인할 수 있도록 메시지 박스를 표시합니다.
			MessageBox.confirm("선택된 데이터를 삭제하시겠습니까?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: (sAction) => {
					// 사용자가 "YES"를 선택한 경우 삭제 작업을 시작합니다.
					if (sAction === MessageBox.Action.YES) {
						let iSuccessCount = 0; // 삭제 성공 횟수를 추적하는 변수
						let iErrorCount = 0;   // 삭제 실패 횟수를 추적하는 변수
						const iTotalCount = aSelectedContexts.length; // 총 삭제 작업의 수
		
						// 선택된 각 항목에 대해 삭제 작업을 수행합니다.
						aSelectedContexts.forEach((oContext) => {
							const sPath = oContext.getPath(); // 각 항목의 경로를 가져옵니다.
							this.odata_model.remove(sPath, {
								success: () => {
									iSuccessCount++; // 삭제 성공 시 성공 카운트를 증가시킵니다.
									// 모든 삭제 작업이 완료된 후 결과 메시지를 표시합니다.
									if (iSuccessCount + iErrorCount === iTotalCount) {
										this._showDeleteResult(iSuccessCount, iErrorCount);
									}
								},
								error: () => {
									iErrorCount++; // 삭제 실패 시 실패 카운트를 증가시킵니다.
									// 모든 삭제 작업이 완료된 후 결과 메시지를 표시합니다.
									if (iSuccessCount + iErrorCount === iTotalCount) {
										this._showDeleteResult(iSuccessCount, iErrorCount);
									}
								}
							});
						});
		
						// 삭제 작업 후 테이블의 선택 상태를 초기화합니다.
						this.oTable.removeSelections(true);
					}
				}
			});
		},
		
		_showDeleteResult: function(iSuccessCount, iErrorCount) {
			// 삭제 결과 메세지 출력 함수
			// 모든 삭제 작업이 완료된 후 결과에 따라 메시지를 표시합니다.
			if (iSuccessCount > 0 && iErrorCount === 0) {
				// 모든 데이터가 성공적으로 삭제된 경우
				MessageBox.success(`${iSuccessCount}개의 데이터가 성공적으로 삭제되었습니다.`);
			} else if (iSuccessCount > 0 && iErrorCount > 0) {
				// 일부 데이터는 성공적으로 삭제되었지만, 일부는 실패한 경우
				MessageBox.warning(`${iSuccessCount}개의 데이터가 성공적으로 삭제되었지만, ${iErrorCount}개의 데이터 삭제에 실패했습니다.`);
			} else if (iErrorCount > 0) {
				// 모든 데이터 삭제가 실패한 경우
				MessageBox.error(`${iErrorCount}개의 데이터 삭제에 실패했습니다.`);
			}
		}
	});
});