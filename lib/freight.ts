import "server-only";
import { getFreightCents } from "@/lib/settings";

/**
 * Freight shipping abstraction (Milestone 3).
 *
 * The Apt.Bed ships by LTL/freight carrier, not parcel. Milestone 2 shipped a
 * single flat rate; this layer keeps that behaviour while providing a clean
 * seam to plug in a live carrier-rating API (FedEx Freight, uShip, etc.) once
 * the carrier is finalized — without touching checkout/pricing code.
 *
 * Select the provider with the FREIGHT_PROVIDER env var ("flat" | "carrier").
 */

export interface FreightShipmentLine {
  sizeKey: string;
  heightKey: string;
  woodKey: string;
  quantity: number;
}

export interface FreightShipment {
  state: string;
  zip?: string;
  lines: FreightShipmentLine[];
  subtotalCents?: number;
}

export interface FreightQuote {
  cents: number;
  label: string;
  provider: string;
  estimatedBusinessDays?: string;
}

export interface FreightProvider {
  readonly name: string;
  quote(shipment: FreightShipment): Promise<FreightQuote>;
}

/** Flat-rate provider: one configurable freight charge (admin-editable in Settings). */
class FlatFreightProvider implements FreightProvider {
  readonly name = "flat";
  async quote(_shipment: FreightShipment): Promise<FreightQuote> {
    const cents = await getFreightCents();
    return {
      cents,
      label: "Flat-rate freight",
      provider: this.name,
      estimatedBusinessDays: "7–21",
    };
  }
}

/**
 * Live carrier-rate provider — the M3 integration point. Wire the carrier's
 * rating endpoint in here (using shipment.zip + per-item dimensions/weight).
 * Until CARRIER credentials are configured it transparently falls back to the
 * flat rate, so checkout never blocks.
 */
class CarrierFreightProvider implements FreightProvider {
  readonly name = "carrier";
  private readonly fallback = new FlatFreightProvider();

  async quote(shipment: FreightShipment): Promise<FreightQuote> {
    const configured = Boolean(process.env.FREIGHT_CARRIER_API_KEY);
    if (!configured) {
      const flat = await this.fallback.quote(shipment);
      return { ...flat, provider: `${this.name} (fallback: flat)` };
    }

    // TODO(M3): POST shipment (destination ZIP + item dims/weight) to the
    // carrier rating API and return the cheapest/selected service level, e.g.:
    //   const res = await fetch(process.env.FREIGHT_CARRIER_URL!, { ... });
    //   return { cents, label: service.name, provider: this.name, estimatedBusinessDays };
    const flat = await this.fallback.quote(shipment);
    return { ...flat, provider: `${this.name} (not yet implemented)` };
  }
}

export function getFreightProvider(): FreightProvider {
  const choice = (process.env.FREIGHT_PROVIDER || "flat").toLowerCase();
  return choice === "carrier" ? new CarrierFreightProvider() : new FlatFreightProvider();
}

/** Quote freight for a shipment using the configured provider. */
export async function quoteFreight(shipment: FreightShipment): Promise<FreightQuote> {
  return getFreightProvider().quote(shipment);
}
