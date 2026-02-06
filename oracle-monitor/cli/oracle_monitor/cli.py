import click
import json
import os
from oracle_monitor.query import get_latest_snapshot, get_snapshots_since, get_snapshot_by_id
from oracle_monitor.diff import get_state_diff
from oracle_monitor.formatter import print_json, print_diff
from dotenv import load_dotenv

# Load env from root if possible, or local
# For this CLI we assume environment variables are set or available
load_dotenv()

@click.group()
def main():
    """Oracle Monitor CLI - God Mode for Multi-Agent Systems"""
    pass

@main.command()
def latest():
    """Get the most recent system snapshot"""
    snapshot = get_latest_snapshot()
    if snapshot:
        print_json(snapshot)
    else:
        click.echo("No snapshots found.", err=True)

@main.command()
@click.argument('minutes', type=int)
def since(minutes):
    """Get snapshots from the last N minutes"""
    snapshots = get_snapshots_since(minutes)
    print_json(snapshots)

@main.command()
@click.argument('id1')
@click.argument('id2')
def diff(id1, id2):
    """Show differences between two snapshots"""
    snap1 = get_snapshot_by_id(id1)
    snap2 = get_snapshot_by_id(id2)
    
    if not snap1 or not snap2:
        click.echo("One or both snapshots not found", err=True)
        return

    diff_data = get_state_diff(snap1, snap2)
    print_diff(diff_data)

if __name__ == "__main__":
    main()
