import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemConfigComponent } from './system-config.component';
import { SystemConfigurationService } from '../../core/swagger';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SystemConfigComponent', () => {
    let component: SystemConfigComponent;
    let fixture: ComponentFixture<SystemConfigComponent>;
    let systemConfigServiceSpy: jasmine.SpyObj<SystemConfigurationService>;
    let messageServiceSpy: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const configSpy = jasmine.createSpyObj('SystemConfigurationService', ['systemConfigurationControllerGetConfig', 'systemConfigurationControllerUpdateManyConfigValues']);
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        // Mock initial config load
        configSpy.systemConfigurationControllerGetConfig.and.returnValue(of({
            reportsRetentionInMonths: 1,
            inactiveUsersRetentionInMonths: 1,
            allowReportsIncomeFromUnknownSources: false,
            enableAISummary: true,
            enableAIAutoSeverityAssignation: false,
            enableAIAutoSummaryGeneration: false,
            summaryGenerationIncludeProjectDescription: false,
            summaryGenerationIncludeProjectEnvironment: false,
            summaryGenerationIncludeReportDetails: false,
            summaryGenerationIncludeReportLogs: false,
            summaryGenerationIncludeReportFormData: false,
            summaryGenerationIncludeReportEnvironment: false,
            summaryGenerationIncludeComments: false
        }));

        await TestBed.configureTestingModule({
            imports: [SystemConfigComponent, NoopAnimationsModule],
            providers: [
                { provide: SystemConfigurationService, useValue: configSpy }
            ]
        })
            .overrideComponent(SystemConfigComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(SystemConfigComponent);
        component = fixture.componentInstance;
        systemConfigServiceSpy = TestBed.inject(SystemConfigurationService) as jasmine.SpyObj<SystemConfigurationService>;
        messageServiceSpy = messageSpy;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load config on afterViewInit', () => {
        fixture.detectChanges(); // triggers ngAfterViewInit
        expect(systemConfigServiceSpy.systemConfigurationControllerGetConfig).toHaveBeenCalled();
        expect(component.configForm.value.reportsRetentionInMonths).toBe(1);
        expect(component.configForm.value.enableAISummary).toBeTrue();
    });

    it('should save config', () => {
        fixture.detectChanges();

        component.configForm.patchValue({ reportsRetentionInMonths: 2 });
        systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues.and.returnValue(of({}));

        component.save();

        expect(component.loading()).toBeFalse(); // finally loads again
        expect(systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(systemConfigServiceSpy.systemConfigurationControllerGetConfig).toHaveBeenCalledTimes(2); // Initial + reload
    });

    it('should handle load error', () => {
        systemConfigServiceSpy.systemConfigurationControllerGetConfig.and.returnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });

    it('should handle save error', () => {
        fixture.detectChanges();
        systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues.and.returnValue(throwError(() => new Error('Error')));

        component.save();

        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });
});
