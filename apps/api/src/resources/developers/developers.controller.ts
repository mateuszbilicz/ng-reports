import {Controller, Get, Header, StreamableFile} from '@nestjs/common';
import {createReadStream, readdirSync} from "node:fs";
import {join} from 'node:path';
import {ApiConsumes, ApiOkResponse, ApiResponse} from "@nestjs/swagger";
import {Public} from "../auth/auth.guard";

@Controller('developers')
@Public()
export class DevelopersController {
    private path = join(process.cwd(), 'lib-releases');

    constructor() {
        this.findLatestLibVersion();
    }

    @Get('lib-file')
    @Header('Content-Type', 'application/tar+gzip')
    @Header('Content-Disposition', 'attachment; filename="ng-reports.tgz"')
    getLibFile() {
        const filename = this.findLatestLibVersion()[0];
        return new StreamableFile(
            createReadStream(join(this.path, filename))
        );
    }

    private findLatestLibVersion() {
        const versions = readdirSync(this.path)
            .map<[string, number]>(filename =>
                [
                    filename,
                    parseInt(
                        filename
                            .split('-')[2]
                            .split('.tgz')[0]
                            .replaceAll('.', '')
                    )
                ]
            )
            .sort((a, b) => b[1] - a[1]);
        return versions[0];
    }
}
