import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemConfigComponent } from './system-config.component';
import { SystemConfigurationService } from '../../core/swagger';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('SystemConfigComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: SystemConfigComponent;
    let fixture: ComponentFixture<SystemConfigComponent>;
    let systemConfigServiceSpy: any;
    let messageServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(async () => {
        const configSpy = createSpyObj(['systemConfigurationControllerGetConfig', 'systemConfigurationControllerUpdateManyConfigValues']);
        const messageSpy = createSpyObj(['add']);

        configSpy.systemConfigurationControllerGetConfig.mockReturnValue(of({
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
        systemConfigServiceSpy = TestBed.inject(SystemConfigurationService);
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
        expect(component.configForm.value.enableAISummary).toBe(true);
    });

    it('should save config', () => {
        fixture.detectChanges();

        component.configForm.patchValue({ reportsRetentionInMonths: 2 });
        systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues.mockReturnValue(of({}));

        component.save();

        expect(component.loading()).toBe(false); // finally loads again
        expect(systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(systemConfigServiceSpy.systemConfigurationControllerGetConfig).toHaveBeenCalledTimes(2); // Initial + reload
    });

    it('should handle load error', () => {
        systemConfigServiceSpy.systemConfigurationControllerGetConfig.mockReturnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should handle save error', () => {
        fixture.detectChanges();
        systemConfigServiceSpy.systemConfigurationControllerUpdateManyConfigValues.mockReturnValue(throwError(() => new Error('Error')));

        component.save();

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
});
