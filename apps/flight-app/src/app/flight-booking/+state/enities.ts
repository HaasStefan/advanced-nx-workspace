

export interface FligthDto {
    id: string,
    from: Date,
    to: Date,
    tickets: TicketDto[]
}

export interface TicketDto {
    id: string,
    price: number,
    passenger: PassengerDto
}

export interface PassengerDto {
    id: string,
    firstName: string,
    lastName: string
}

// NOMRALIZED:

export interface FlightInStore {
    id: string,
    from: Date,
    to: Date,
    ticketIds: string[]
}

export interface TicketInStore {
    id: string,
    price: number,
    flightId: string,
    passengerId: string
}

export interface PassengerInStore {
    id: string,
    firstName: string,
    lastName: string,
    ticketId: string
}
