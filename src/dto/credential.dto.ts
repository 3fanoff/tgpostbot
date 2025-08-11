import { USER_ROLE } from '@lib/bot.const';
import { PartialType } from '@nestjs/mapped-types';

export class CredentialDto {
    role: USER_ROLE;

    active: boolean;

    activeUntil: Date | null;

    setIsActive(status: boolean) {
        this.active = status;
    }

    get isActive() {
        return this.active;
    }

    set isActive(status: boolean) {
        this.active = status;
    }
}

export class UpdateCredentialDto extends PartialType(CredentialDto) {}
