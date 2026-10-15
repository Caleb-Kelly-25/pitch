export class GameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameError';
    }
}

export class GameNotFoundError extends GameError {
    constructor(gameId: string) {
        super(`Game ${gameId} not found`);
        this.name = 'GameNotFoundError';
    }
}

export class WrongPhaseError extends GameError {
    constructor(expected: string, actual: string) {
        super(`Expected phase '${expected}', got '${actual}'`);
        this.name = 'WrongPhaseError';
    }
}

export class InvalidBidError extends GameError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidBidError';
    }
}

export class InvalidPlayError extends GameError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPlayError';
    }
}

// Thrown when a state transition lost the compare-and-swap race too many times
// in a row. Retryable from the client's point of view — the action was never
// applied, so resubmitting it is safe.
export class ConcurrencyConflictError extends GameError {
    constructor(gameId: string, attempts: number) {
        super(`Could not commit action on game ${gameId} after ${attempts} attempts`);
        this.name = 'ConcurrencyConflictError';
    }
}
