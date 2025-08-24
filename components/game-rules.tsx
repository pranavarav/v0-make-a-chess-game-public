import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

export default function GameRules() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Chess Variant Rules</DialogTitle>
          <DialogDescription>This chess variant uses special turn sequence rules</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Move Sequence</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>White begins with 1 move</li>
              <li>Black responds with 2 moves</li>
              <li>White then gets 2 moves</li>
              <li>Pattern continues throughout the game</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Key Restrictions</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>A player CANNOT move the same piece twice in their turn</li>
              <li>Encourages diverse piece engagement</li>
              <li>Prevents piece "locking" or over-concentration</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Check Resolution</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                When a player puts the opponent in check:
                <ul className="list-disc pl-5 mt-1">
                  <li>The opponent gets 1 move to resolve the check</li>
                  <li>After resolving the check, the player who initiated the check gets 2 moves</li>
                  <li>Normal turn sequence continues afterward</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Special Moves</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Castling counts as a single move</li>
              <li>En passant follows standard chess rules</li>
              <li>Pawn promotion occurs on standard chess terms</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Strategic Implications</h3>
            <p className="mt-2">This variant forces players to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Activate multiple pieces</li>
              <li>Create diverse board engagement</li>
              <li>Plan moves across different pieces</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
